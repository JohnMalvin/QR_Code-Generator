
import Particles from "react-tsparticles";

import type { Container, Engine } from "tsparticles-engine";
import { useCallback } from "react";
import { loadSlim } from "tsparticles-slim";

const ParticlesComponent = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(
    async (container: Container | undefined) => {
      console.log("Particles loaded:", container);
    },
    [],
  );
  
  return (
      <>
        <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        url="/particles.json"
        />
      </>
  );
};

export default ParticlesComponent;
