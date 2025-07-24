// src/components/AnimatedBackground.tsx
import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadLinksPreset } from 'tsparticles-preset-links';
import type { Engine } from 'tsparticles-engine';

export default function AnimatedBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadLinksPreset(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        preset: "links",
        background: {
          color: "#000000"
        },
        particles: {
          color: {
            value: "#ffffff"
          },
          links: {
            enable: true,
            color: "#ffffff",
            distance: 150,
            opacity: 0.5,
            width: 1
          },
          move: {
            enable: true,
            speed: 1
          },
          number: {
            value: 60
          },
          opacity: {
            value: 0.5
          },
          shape: {
            type: "circle"
          },
          size: {
            value: 2
          }
        },
        fullScreen: {
          enable: true,
          zIndex: -1
        }
      }}
    />
  );
}
