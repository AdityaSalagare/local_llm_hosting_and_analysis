"""
LLM Client for local model inference using llama.cpp
Supports streaming responses for real-time chat
"""
import os
import json
from typing import Iterator, Optional, List, Dict
from llama_cpp import Llama
import requests


class LLMClient:
    """Client for interacting with local LLM models"""
    
    def __init__(self, model_path: Optional[str] = None, use_lm_studio: bool = False, lm_studio_url: str = "http://localhost:1234"):
        """
        Initialize LLM client
        
        Args:
            model_path: Path to .gguf model file (for direct llama.cpp)
            use_lm_studio: If True, use LM Studio API instead of direct model loading
            lm_studio_url: LM Studio API URL
        """
        self.use_lm_studio = use_lm_studio
        self.lm_studio_url = lm_studio_url
        self.model = None
        
        if not use_lm_studio:
            if model_path and os.path.exists(model_path):
                try:
                    self.model = Llama(
                        model_path=model_path,
                        n_ctx=4096,  # Context window
                        n_threads=4,  # CPU threads
                        verbose=False
                    )
                except Exception as e:
                    print(f"Warning: Could not load model directly: {e}")
                    print("Falling back to LM Studio API")
                    self.use_lm_studio = True
            else:
                print("Model path not provided or file not found. Using LM Studio API.")
                self.use_lm_studio = True
    
    def generate(self, prompt: str, max_tokens: int = 512, temperature: float = 0.7, 
                 stop: Optional[List[str]] = None) -> str:
        """Generate a single response (non-streaming)"""
        if self.use_lm_studio:
            return self._generate_lm_studio(prompt, max_tokens, temperature, stop)
        else:
            return self._generate_direct(prompt, max_tokens, temperature, stop)
    
    def stream(self, prompt: str, max_tokens: int = 512, temperature: float = 0.7,
               stop: Optional[List[str]] = None) -> Iterator[str]:
        """Generate streaming response"""
        if self.use_lm_studio:
            yield from self._stream_lm_studio(prompt, max_tokens, temperature, stop)
        else:
            yield from self._stream_direct(prompt, max_tokens, temperature, stop)
    
    def _generate_direct(self, prompt: str, max_tokens: int, temperature: float, 
                        stop: Optional[List[str]]) -> str:
        """Generate using direct llama.cpp"""
        if not self.model:
            raise RuntimeError("Model not loaded")
        
        response = self.model(
            prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            stop=stop or [],
            echo=False
        )
        return response['choices'][0]['text']
    
    def _stream_direct(self, prompt: str, max_tokens: int, temperature: float,
                      stop: Optional[List[str]]) -> Iterator[str]:
        """Stream using direct llama.cpp"""
        if not self.model:
            raise RuntimeError("Model not loaded")
        
        stream = self.model(
            prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            stop=stop or [],
            echo=False,
            stream=True
        )
        
        for output in stream:
            if 'choices' in output and len(output['choices']) > 0:
                delta = output['choices'][0].get('text', '')
                if delta:
                    yield delta
    
    def _generate_lm_studio(self, prompt: str, max_tokens: int, temperature: float,
                           stop: Optional[List[str]]) -> str:
        """Generate using LM Studio API"""
        try:
            response = requests.post(
                f"{self.lm_studio_url}/v1/completions",
                json={
                    "prompt": prompt,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "stop": stop or []
                },
                timeout=60
            )
            response.raise_for_status()
            data = response.json()
            return data['choices'][0]['text']
        except Exception as e:
            raise RuntimeError(f"LM Studio API error: {e}")
    
    def _stream_lm_studio(self, prompt: str, max_tokens: int, temperature: float,
                         stop: Optional[List[str]]) -> Iterator[str]:
        """Stream using LM Studio API"""
        try:
            response = requests.post(
                f"{self.lm_studio_url}/v1/completions",
                json={
                    "prompt": prompt,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "stop": stop or [],
                    "stream": True
                },
                stream=True,
                timeout=60
            )
            response.raise_for_status()
            
            for line in response.iter_lines():
                if line:
                    line_str = line.decode('utf-8')
                    if line_str.startswith('data: '):
                        data_str = line_str[6:]
                        if data_str == '[DONE]':
                            break
                        try:
                            data = json.loads(data_str)
                            if 'choices' in data and len(data['choices']) > 0:
                                delta = data['choices'][0].get('text', '')
                                if delta:
                                    yield delta
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            raise RuntimeError(f"LM Studio API streaming error: {e}")


# Global LLM client instance
_llm_client = None


def get_llm_client() -> LLMClient:
    """Get or create global LLM client instance"""
    global _llm_client
    if _llm_client is None:
        model_path = os.getenv('MODEL_PATH', 'model.gguf')
        use_lm_studio = os.getenv('USE_LM_STUDIO', 'false').lower() == 'true'
        lm_studio_url = os.getenv('LM_STUDIO_URL', 'http://localhost:1234')
        
        _llm_client = LLMClient(
            model_path=model_path,
            use_lm_studio=use_lm_studio,
            lm_studio_url=lm_studio_url
        )
    return _llm_client

