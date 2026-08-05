from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

# Import all models so they register with Base.metadata
from models import (
    User, Profile, Education, Skill, Project,
    Experience, Certification, Achievement, Publication,
    Volunteering, Extracurricular, ResumeHistory,
)

# Import routers
from routers import (
    auth, profile, education, skill, project,
    experience, certification, achievement, publication,
    volunteering, extracurricular, ai_resume,
)


@asynccontextmanager
async def lifespan(app):
    """Create all database tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Portinity API",
    description="Resume & Portfolio Data Management Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(education.router)
app.include_router(skill.router)
app.include_router(project.router)
app.include_router(experience.router)
app.include_router(certification.router)
app.include_router(achievement.router)
app.include_router(publication.router)
app.include_router(volunteering.router)
app.include_router(extracurricular.router)
app.include_router(ai_resume.router)


@app.get("/")
def root():
    return {"message": "Portinity API is running", "docs": "/docs"}
