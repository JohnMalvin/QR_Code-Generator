import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Pickr: {
      create: (options: {
        el: HTMLElement;
        theme: string;
        default: string;
        components: {
          preview: boolean;
          opacity: boolean;
          hue: boolean;
          interaction: {
            hex: boolean;
            rgba: boolean;
            hsla: boolean;
            input: boolean;
            clear: boolean;
            save: boolean;
          };
        };
      }) => {
        on: (
          event: string,
          callback: (color: {
            toHEXA: () => { toString: () => string };
          }) => void
        ) => void;
        destroyAndRemove: () => void;
      };
    };
  }
}

const PickrComponent = () => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.Pickr || !buttonRef.current) return;

    const pickr = window.Pickr.create({
      el: buttonRef.current,
      theme: 'monolith',
      default: '#00bcd4',
      components: {
        preview: true,
        opacity: true,
        hue: true,
        interaction: {
          hex: true,
          rgba: true,
          hsla: true,
          input: true,
          clear: true,
          save: true,
        },
      },
    });

    pickr.on('save', (color) => {
      console.log('Saved color:', color.toHEXA().toString());
    });

    return () => pickr.destroyAndRemove();
  }, []);

  return (
    <div style={{ height: '40px' }}>
      <div
        ref={buttonRef}
        className="pickr-launcher"
        style={{
          width: '40px',
          height: '40px',
          background: '#00bcd4',
          borderRadius: '5px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      ></div>
    </div>
  );
};

export default PickrComponent;
