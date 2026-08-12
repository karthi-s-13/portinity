from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from middleware.auth import get_current_user
from models import (
    User, Profile, Education, Skill, Project,
    Experience, Certification, Achievement,
    Publication, Volunteering, Extracurricular,
    ResumeHistory
)

from rag.rag_engine import (
    init_pgvector_db,
    embed_and_store_user_data,
    generate_tailored_resume
)
from services.html_compiler import compile_html_to_pdf

router = APIRouter(prefix="/api/ai-resume", tags=["AI Resume RAG Generator"])


class GenerateResumeRequest(BaseModel):
    job_description: str
    target_role: Optional[str] = "Full Stack Engineer"
    template_id: Optional[str] = "blue-line"
    experience_level: Optional[str] = ""


@router.post("/sync-embeddings")
def sync_user_embeddings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Extract all user profile entities from relational DB, chunk, embed via OpenRouter, 
    and UPSERT into PostgreSQL 17 pgvector database.
    """
    user_id = current_user.id
    entities = []

    # Initialize pgvector tables if not exists
    try:
        init_pgvector_db()
    except Exception as e:
        print(f"⚠️ Note on pgvector init: {e}")

    # 1. Projects
    projects = db.query(Project).filter(Project.user_id == user_id).all()
    for p in projects:
        content = f"Project: {p.title}. Category: {p.category or 'Software'}. Tech Stack: {p.tech_stack or ''}. Description: {p.description or ''}. Repository URL: {p.repo_url or ''}. Demo URL: {p.live_url or ''}."
        entities.append({
            'type': 'project',
            'id': p.id,
            'title': p.title,
            'content': content,
            'metadata': {'category': p.category, 'tech_stack': p.tech_stack, 'live_url': p.live_url, 'repo_url': p.repo_url}
        })

    # 2. Work Experience
    experiences = db.query(Experience).filter(Experience.user_id == user_id).all()
    for e in experiences:
        role_name = e.role or 'Software Engineer'
        company_name = e.company or 'Company'
        content = f"Role: {role_name} at {company_name}. Location: {e.location or ''}. Dates: {e.start_date or ''} - {e.end_date or 'Present'}. Responsibilities: {e.description or ''}"
        entities.append({
            'type': 'experience',
            'id': e.id,
            'title': f"{role_name} @ {company_name}",
            'content': content,
            'metadata': {'company': company_name, 'role': role_name}
        })

    # 3. Skills
    skills = db.query(Skill).filter(Skill.user_id == user_id).all()
    for s in skills:
        content = f"Skill: {s.name}. Category: {s.category or 'General'}. Proficiency: {s.proficiency or 'Intermediate'}"
        entities.append({
            'type': 'skill',
            'id': s.id,
            'title': s.name,
            'content': content,
            'metadata': {'category': s.category, 'proficiency': s.proficiency}
        })

    # 4. Certifications
    certs = db.query(Certification).filter(Certification.user_id == user_id).all()
    for c in certs:
        content = f"Certification: {c.title}. Issuing Org: {c.issuing_org or ''}. Category: {c.category or ''}. Credential ID: {c.credential_id or ''}. Credential URL: {c.credential_url or ''}."
        entities.append({
            'type': 'certification',
            'id': c.id,
            'title': c.title,
            'content': content,
            'metadata': {'issuing_org': c.issuing_org, 'credential_url': c.credential_url}
        })

    # 5. Achievements
    achievements = db.query(Achievement).filter(Achievement.user_id == user_id).all()
    for a in achievements:
        content = f"Achievement: {a.title}. Issuer: {a.issuer or ''}. Description: {a.description or ''}"
        entities.append({
            'type': 'achievement',
            'id': a.id,
            'title': a.title,
            'content': content,
            'metadata': {'issuer': a.issuer}
        })

    # 6. Publications
    publications = db.query(Publication).filter(Publication.user_id == user_id).all()
    for pub in publications:
        content = f"Publication: {pub.title}. Publisher: {pub.publisher or ''}. Type: {pub.pub_type or ''}. Authors: {pub.authors or ''}. Description: {pub.description or ''}"
        entities.append({
            'type': 'publication',
            'id': pub.id,
            'title': pub.title,
            'content': content,
            'metadata': {'publisher': pub.publisher, 'pub_type': pub.pub_type, 'doi': pub.doi}
        })

    # 7. Volunteering
    volunteerings = db.query(Volunteering).filter(Volunteering.user_id == user_id).all()
    for v in volunteerings:
        content = f"Volunteering: {v.title or v.role or 'Volunteer'}. Organization: {v.organization}. Cause: {v.cause or ''}. Impact: {v.impact_text or ''}. Description: {v.description or ''}"
        entities.append({
            'type': 'volunteering',
            'id': v.id,
            'title': f"{v.role or 'Volunteer'} @ {v.organization}",
            'content': content,
            'metadata': {'organization': v.organization, 'cause': v.cause}
        })

    # 8. Extracurricular
    extras = db.query(Extracurricular).filter(Extracurricular.user_id == user_id).all()
    for ex in extras:
        content = f"Extracurricular Activity: {ex.title}. Organization: {ex.organization or ''}. Role: {ex.role or ''}. Category: {ex.category or ''}. Description: {ex.description or ''}"
        entities.append({
            'type': 'extracurricular',
            'id': ex.id,
            'title': ex.title,
            'content': content,
            'metadata': {'category': ex.category, 'organization': ex.organization}
        })

    if not entities:
        return {
            "status": "warning",
            "message": "No profile entities found. Please fill in your Experience, Projects, or Skills first.",
            "synced_count": 0
        }

    try:
        embed_and_store_user_data(user_id, entities)
        return {
            "status": "success",
            "message": f"Successfully indexed {len(entities)} entities into pgvector embedding database.",
            "synced_count": len(entities)
        }
    except Exception as err:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to index embeddings in pgvector: {str(err)}"
        )


@router.post("/generate")
def generate_ai_resume(
    payload: GenerateResumeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate tailored ATS LaTeX & JSON resume using OpenRouter RAG engine.
    Also handles dynamic replacement sections if any compulsory section is missing.
    """
    if not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    user_id = current_user.id
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    educations = db.query(Education).filter(Education.user_id == user_id).all()
    skills = db.query(Skill).filter(Skill.user_id == user_id).all()
    experiences = db.query(Experience).filter(Experience.user_id == user_id).all()
    projects = db.query(Project).filter(Project.user_id == user_id).all()
    certs = db.query(Certification).filter(Certification.user_id == user_id).all()
    achievements = db.query(Achievement).filter(Achievement.user_id == user_id).all()
    publications = db.query(Publication).filter(Publication.user_id == user_id).all()
    volunteerings = db.query(Volunteering).filter(Volunteering.user_id == user_id).all()
    extracurriculars = db.query(Extracurricular).filter(Extracurricular.user_id == user_id).all()

    # Enforce profile, education, skills, and projects data presence
    if not profile or not (profile.first_name and profile.first_name.strip()) or not (profile.last_name and profile.last_name.strip()):
        raise HTTPException(
            status_code=400,
            detail="Please complete your profile details (First Name and Last Name) under the Profile tab before generating an AI resume."
        )
    if not educations:
        raise HTTPException(
            status_code=400,
            detail="Please add at least one Education entry under the Education tab before generating an AI resume."
        )
    if not skills:
        raise HTTPException(
            status_code=400,
            detail="Please add at least one Skill under the Skills tab before generating an AI resume."
        )
    if not projects:
        raise HTTPException(
            status_code=400,
            detail="Please add at least one Project under the Projects tab before generating an AI resume."
        )

    # Static Contact & Education dictionary
    static_info = {
        "name": f"{profile.first_name if profile and profile.first_name else ''} {profile.last_name if profile and profile.last_name else ''}".strip() or current_user.email.split('@')[0].title(),
        "headline": payload.target_role or (profile.headline if profile else "Software Developer"),
        "summary": profile.summary if profile and profile.summary else "",
        "email": (profile.email if profile and profile.email else current_user.email),
        "phone": (profile.phone if profile and profile.phone else "+1 (123) 456-7890"),
        "location": (profile.location if profile and profile.location else "City, Country"),
        "linkedin": (profile.linkedin if profile and profile.linkedin else ""),
        "github": (profile.github if profile and profile.github else ""),
        "education": [
            {
                "institution": edu.institution or "University",
                "location": edu.location or "City, Country",
                "degree": f"{edu.degree or ''} in {edu.field_of_study or ''}".strip() if edu.field_of_study else (edu.degree or "Bachelor of Science"),
                "dates": f"{edu.start_date.strftime('%b %Y') if edu.start_date else ''} - {edu.end_date.strftime('%b %Y') if edu.end_date else 'Present'}".strip(" - ")
            }
            for edu in educations
        ],
        "raw_data": {
            "skills": [s.name for s in skills],
            "experiences": [
                {
                    "role": e.role,
                    "company": e.company,
                    "location": e.location,
                    "dates": f"{e.start_date.strftime('%b %Y') if e.start_date else ''} - {e.end_date.strftime('%b %Y') if e.end_date else 'Present'}".strip(" - "),
                    "bullets": [b.strip() for b in (e.description or "").split("\n") if b.strip()]
                }
                for e in experiences
            ],
            "projects": [
                {
                    "title": p.title,
                    "tech_stack": p.tech_stack,
                    "dates": f"{p.start_date.strftime('%b %Y') if p.start_date else ''} - {p.end_date.strftime('%b %Y') if p.end_date else 'Present'}".strip(" - "),
                    "bullets": [b.strip() for b in (p.description or "").split("\n") if b.strip()],
                    "live_url": p.live_url,
                    "repo_url": p.repo_url
                }
                for p in projects
            ],
            "certifications": [
                {"title": c.title, "issuer": c.issuing_org, "dates": c.issue_date.strftime('%b %Y') if c.issue_date else '', "credential_url": c.credential_url}
                for c in certs
            ],
            "achievements": [
                {"title": a.title, "description": a.description, "issuer": a.issuer}
                for a in achievements
            ],
            "publications": [
                {
                    "title": pub.title,
                    "publisher": pub.publisher,
                    "pub_type": pub.pub_type,
                    "authors": pub.authors,
                    "dates": pub.publish_date.strftime('%b %Y') if pub.publish_date else '',
                    "description": pub.description
                }
                for pub in publications
            ],
            "volunteerings": [
                {
                    "role": v.role or v.title or "Volunteer",
                    "organization": v.organization,
                    "cause": v.cause,
                    "dates": f"{v.start_date.strftime('%b %Y') if v.start_date else ''} - {v.end_date.strftime('%b %Y') if v.end_date else 'Present'}".strip(" - "),
                    "description": v.description or v.impact_text
                }
                for v in volunteerings
            ],
            "extracurriculars": [
                {
                    "title": ex.title,
                    "organization": ex.organization,
                    "role": ex.role,
                    "category": ex.category,
                    "dates": f"{ex.start_date.strftime('%b %Y') if ex.start_date else ''} - {ex.end_date.strftime('%b %Y') if ex.end_date else 'Present'}".strip(" - "),
                    "description": ex.description
                }
                for ex in extracurriculars
            ]
        }
    }

    try:
        # First ensure embeddings exist
        sync_user_embeddings(current_user=current_user, db=db)
        
        # Generate LaTeX & JSON using Nemotron LLM via Jinja2 template
        latex_code, resume_json = generate_tailored_resume(
            user_id, 
            payload.job_description, 
            static_info, 
            payload.template_id,
            payload.experience_level
        )

        # Save to resume history
        try:
            history_entry = ResumeHistory(
                user_id=user_id,
                job_description=payload.job_description,
                target_role=payload.target_role or "Full Stack Engineer",
                template_id=payload.template_id or "blue-line",
                experience_level=payload.experience_level or "",
                latex_code=latex_code,
                resume_json=resume_json
            )
            db.add(history_entry)
            db.commit()
            db.refresh(history_entry)
            history_id = history_entry.id
        except Exception as db_err:
            print(f"⚠️ Failed to save resume to history: {db_err}")
            db.rollback()
            history_id = None

        return {
            "status": "success",
            "latex_code": latex_code,
            "resume_json": resume_json,
            "static_info": static_info,
            "history_id": history_id
        }
    except Exception as err:
        raise HTTPException(
            status_code=500,
            detail=f"AI Resume Generation failed: {str(err)}"
        )



class CompileHTMLPDFRequest(BaseModel):
    html_content: str


@router.post("/compile-html-pdf")
async def compile_html_pdf(
    payload: CompileHTMLPDFRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Compiles the provided HTML string into a PDF binary.
    """
    if not payload.html_content.strip():
        raise HTTPException(status_code=400, detail="HTML content cannot be empty.")

    pdf_bytes = await compile_html_to_pdf(payload.html_content)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=Tailored_Resume.pdf"
        }
    )


@router.get("/history")
def get_resume_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the history of generated resumes for the logged-in user."""
    histories = db.query(ResumeHistory).filter(
        ResumeHistory.user_id == current_user.id
    ).order_by(ResumeHistory.created_at.desc()).all()
    
    result = []
    for h in histories:
        result.append({
            "id": h.id,
            "job_description": h.job_description,
            "target_role": h.target_role,
            "template_id": h.template_id,
            "experience_level": h.experience_level,
            "latex_code": h.latex_code,
            "resume_json": h.resume_json,
            "created_at": h.created_at.isoformat() if h.created_at else None
        })
    return result


@router.delete("/history/{id}")
def delete_resume_history(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific resume history entry."""
    history = db.query(ResumeHistory).filter(
        ResumeHistory.id == id,
        ResumeHistory.user_id == current_user.id
    ).first()
    
    if not history:
        raise HTTPException(status_code=404, detail="Resume history entry not found.")
        
    db.delete(history)
    db.commit()
    return {"status": "success", "message": "Resume history entry deleted successfully."}


