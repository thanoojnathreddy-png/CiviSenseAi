from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime
from datetime import datetime
from app.db.session import Base

class CitizenRequestDB(Base):
    __tablename__ = "citizen_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    request_id = Column(String(64), unique=True, index=True, nullable=False)
    created_at = Column(String(64), index=True, nullable=False)
    
    # Original Feedback & Language
    raw_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=True)
    language = Column(String(64), default="English", index=True)
    input_source = Column(String(32), default="text")  # "voice" or "text"
    
    # Geospatial & Regional Information
    country = Column(String(64), default="India", index=True)
    state = Column(String(64), default="Telangana", index=True)
    district = Column(String(64), default="Warangal", index=True)
    locality = Column(String(128), default="General District Area")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Channel & Voice Details
    is_voice = Column(Boolean, default=False)
    voice_duration_sec = Column(Float, nullable=True)
    
    # AI Classification & Urgency
    category = Column(String(64), index=True, nullable=False)
    subcategory = Column(String(128), nullable=True)
    severity = Column(Integer, default=7)
    urgency = Column(String(32), default="High")
    affected_group = Column(String(128), nullable=True)
    status = Column(String(64), default="Under Policy Review")
    
    # Separation of real user submissions vs baseline demonstration signals
    is_demo = Column(Boolean, default=False, index=True)
    sentiment = Column(String(64), nullable=True, default="Concerned")
    key_entities = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "request_id": self.request_id,
            "created_at": self.created_at,
            "raw_text": self.raw_text,
            "translated_text": self.translated_text or self.raw_text,
            "language": self.language,
            "input_source": self.input_source or ("voice" if self.is_voice else "text"),
            "country": self.country,
            "state": self.state,
            "district": self.district,
            "locality": self.locality,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "is_voice": self.is_voice,
            "voice_duration_sec": self.voice_duration_sec,
            "category": self.category,
            "subcategory": self.subcategory,
            "severity": self.severity,
            "urgency": self.urgency,
            "affected_group": self.affected_group,
            "status": self.status,
            "sentiment": self.sentiment or "Concerned",
            "key_entities": self.key_entities or "",
            "is_demo": bool(self.is_demo)
        }

