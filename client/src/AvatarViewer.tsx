// src/components/AvatarViewer.tsx
import React, { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import { Mesh } from 'three'

function Avatar({ triggerTalk }: { triggerTalk: boolean }) {
  const { scene } = useGLTF('/avatar.glb') // ✅ Make sure avatar.glb is in /public
  const meshRef = useRef<Mesh | null>(null)

  // Find mesh with morph targets
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as Mesh).isMesh && (child as Mesh).morphTargetInfluences) {
        meshRef.current = child as Mesh
      }
    })
  }, [scene])

  // Lip sync animation (basic)
  useEffect(() => {
    if (!meshRef.current || !triggerTalk) return

    let frame = 0
    const interval = setInterval(() => {
      if (meshRef.current?.morphTargetInfluences) {
        meshRef.current.morphTargetInfluences[0] = Math.abs(Math.sin(frame))
        frame += 0.3
      }
    }, 60)

    const stop = setTimeout(() => {
      clearInterval(interval)
      if (meshRef.current?.morphTargetInfluences) {
        meshRef.current.morphTargetInfluences[0] = 0
      }
    }, 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(stop)
    }
  }, [triggerTalk])

  return (
    <primitive
      object={scene}
      scale={2.5}
      position={[1, -1, 3]}
      rotation={[0, Math.PI, 0]}
    />
  )
}

export default function AvatarViewer() {
  const [inputText, setInputText] = useState('Hello, I am your AI Interviewer.')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [triggerTalk, setTriggerTalk] = useState(false)
  const isSpeaking = useRef(false)

  // Load available TTS voices
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices()
      setVoices(v)
      setSelectedVoice(v.find((v) => v.lang.startsWith('en')) || v[0])
    }

    window.speechSynthesis.onvoiceschanged = loadVoices
    loadVoices()
  }, [])

  // Speak + trigger lips
  const speak = (text: string) => {
    if (!text || isSpeaking.current) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = selectedVoice || null
    utterance.lang = selectedVoice?.lang || 'en-US'
    utterance.rate = 1
    utterance.pitch = 1

    isSpeaking.current = true
    setTriggerTalk(true)

    utterance.onend = () => {
      isSpeaking.current = false
      setTriggerTalk(false)
    }

    utterance.onerror = () => {
      isSpeaking.current = false
      setTriggerTalk(false)
    }

    speechSynthesis.cancel()
    speechSynthesis.speak(utterance)
  }

  return (
    <div className="w-full h-screen flex flex-col bg-black text-white">
      {/* 3D Avatar */}
      <div className="h-2/3 w-full">
        <Canvas camera={{ position: [0, 2, 5], fov: 30 }}>
          <ambientLight intensity={0.1} />
          <directionalLight position={[2, 2, 2]} intensity={1} />
          <Suspense fallback={null}>
            <Avatar triggerTalk={triggerTalk} />
            <Environment preset="studio" />
          </Suspense>
          <OrbitControls enablePan={false} enableZoom={false} />
        </Canvas>
      </div>

      {/* TTS + Voice */}
      <div className="h-1/3 flex flex-col items-center justify-center gap-4 p-6 bg-gray-900">
        <h2 className="text-xl font-semibold">🗣 Talk to Avatar</h2>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-2/3 p-3 rounded text-black text-lg"
          placeholder="Type what you want the avatar to say"
        />

        <select
          value={selectedVoice?.name}
          onChange={(e) => {
            const voice = voices.find((v) => v.name === e.target.value)
            if (voice) setSelectedVoice(voice)
          }}
          className="w-2/3 p-2 rounded text-black"
        >
          {voices.map((voice, index) => (
            <option key={index} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>

        <button
          onClick={() => speak(inputText)}
          className="bg-blue-600 px-6 py-2 text-lg rounded hover:bg-blue-700"
        >
          Speak
        </button>
      </div>
    </div>
  )
}
