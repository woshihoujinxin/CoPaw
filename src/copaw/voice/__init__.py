"""
Voice module for CoPaw - STT and TTS capabilities
"""

from typing import Optional
import json
import base64
import aiohttp
import asyncio


class VoiceService:
    """Voice service for speech-to-text and text-to-speech"""
    
    def __init__(self, config: Optional[dict] = None):
        self.config = config or {}
        self.stt_provider = self.config.get("stt_provider", "google")  # google, openai, glm
        self.tts_provider = self.config.get("tts_provider", "google")  # google, openai, glm
        self.api_key = self.config.get("api_key", "")
    
    async def speech_to_text(self, audio_data: bytes) -> str:
        """Convert speech to text"""
        if self.stt_provider == "openai":
            return await self._stt_openai(audio_data)
        elif self.stt_provider == "glm":
            return await self._stt_glm(audio_data)
        else:
            return await self._stt_google(audio_data)
    
    async def text_to_speech(self, text: str) -> bytes:
        """Convert text to speech"""
        if self.tts_provider == "openai":
            return await self._tts_openai(text)
        elif self.tts_provider == "glm":
            return await self._tts_glm(text)
        else:
            return await self._tts_google(text)
    
    async def _stt_google(self, audio_data: bytes) -> str:
        """Use Google Speech-to-Text"""
        # Using Web Speech API on frontend is easier
        # This is for potential backend processing
        return ""
    
    async def _stt_openai(self, audio_data: bytes) -> str:
        """Use OpenAI Whisper for STT"""
        url = "https://api.openai.com/v1/audio/transcriptions"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        
        form = aiohttp.FormData()
        form.add_field("file", audio_data, filename="audio.wav", content_type="audio/wav")
        form.add_field("model", "whisper-1")
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, data=form, headers=headers) as resp:
                result = await resp.json()
                return result.get("text", "")
    
    async def _stt_glm(self, audio_data: bytes) -> str:
        """Use GLM for STT"""
        # GLM provides STT through their API
        url = "https://open.bigmodel.cn/api/paas/v4/audio/transcriptions"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        
        form = aiohttp.FormData()
        form.add_field("file", audio_data, filename="audio.wav", content_type="audio/wav")
        form.add_field("model", "glm-4-flash")
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, data=form, headers=headers) as resp:
                result = await resp.json()
                return result.get("text", "")
    
    async def _tts_google(self, text: str) -> bytes:
        """Use Google TTS - return URL for frontend to play"""
        return b""
    
    async def _tts_openai(self, text: str) -> bytes:
        """Use OpenAI TTS"""
        url = "https://api.openai.com/v1/audio/speech"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "tts-1",
            "voice": "alloy",
            "input": text
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data, headers=headers) as resp:
                return await resp.read()
    
    async def _tts_glm(self, text: str) -> bytes:
        """Use GLM TTS"""
        url = "https://open.bigmodel.cn/api/paas/v4/audio/speech"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "glm-4-tts",
            "voice": "ttsx",
            "input": text
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data, headers=headers) as resp:
                return await resp.read()


# Singleton instance
voice_service: Optional[VoiceService] = None


def get_voice_service(config: Optional[dict] = None) -> VoiceService:
    """Get or create voice service instance"""
    global voice_service
    if voice_service is None:
        voice_service = VoiceService(config)
    return voice_service
