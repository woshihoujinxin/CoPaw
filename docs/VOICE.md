# CoPaw Voice - 语音输入功能

基于 CoPaw 添加语音输入能力。

## 功能特性

- 🎤 **语音输入** - 点击麦克风按钮说话，自动转为文字
- 🔊 **语音播报** - AI 回复可以语音朗读
- 🌐 **中文优化** - 优先使用中文语音识别和合成

## 前端集成

### 1. 安装依赖

```bash
cd console
npm install
```

### 2. 使用语音组件

在需要的地方引入 VoiceInput 组件：

```tsx
import { VoiceInput } from "./components/VoiceInput";

function ChatPage() {
  const [inputText, setInputText] = useState("");

  return (
    <div>
      <input 
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <VoiceInput 
        onTextReceived={(text) => setInputText(text)}
      />
    </div>
  );
}
```

## 后端配置

### 语音服务配置

在 `config.toml` 中添加：

```toml
[voice]
stt_provider = "glm"  # google, openai, glm
tts_provider = "glm"  # google, openai, glm
api_key = "your-api-key"
```

## 浏览器兼容性

- Chrome/Edge - 完全支持
- Safari - 部分支持
- Firefox - 需要配置

## 技术栈

- **STT**: Web Speech API (前端) / GLM/OpenAI Whisper (后端)
- **TTS**: Web Speech API (前端) / GLM/OpenAI TTS (后端)

## 待实现

- [ ] 集成后端 TTS 语音播放
- [ ] 支持多种语音模型
- [ ] 语音录制动画效果
- [ ] 快捷键支持
