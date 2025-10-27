
import React from 'react';

export const LoadingPencil: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="pencil">
        <div className="pencil__ball-point"></div>
        <div className="pencil__cap"></div>
        <div className="pencil__cap-base"></div>
        <div className="pencil__middle"></div>
        <div className="pencil__eraser"></div>
      </div>
      <div className="line"></div>
      <p className="text-purple-600 mt-4 text-lg font-medium">Drawing the next page...</p>
      <style>{`
        .pencil {
          display: block;
          width: 15em;
          height: 3em;
          transform: rotate(155deg) translateY(50px);
          animation: pencil-animation 3s infinite;
        }

        .pencil__ball-point {
          width: 0;
          height: 0;
          border-left: 0.7em solid transparent;
          border-right: 0.7em solid transparent;
          border-bottom: 1em solid #222;
          position: absolute;
          left: 0.25em;
          top: 0.9em;
          transform: rotate(118deg);
        }

        .pencil__cap {
          position: absolute;
          width: 3.5em;
          height: 3em;
          background-color: #fde047; /* yellow-300 */
          border-top-right-radius: 0.5em;
          border-bottom-right-radius: 0.5em;
          left: 3.5em;
          transform: rotate(29deg);
        }

        .pencil__cap-base {
          position: absolute;
          width: 3.5em;
          height: 3em;
          background-color: #fde047;
          border-top-right-radius: 0.5em;
          border-bottom-right-radius: 0.5em;
          left: 3.5em;
        }

        .pencil__middle {
          position: absolute;
          width: 7em;
          height: 3em;
          background-color: #a855f7; /* purple-500 */
          border-top-right-radius: 0.5em;
          border-bottom-right-radius: 0.5em;
          left: 7em;
        }

        .pencil__eraser {
          position: absolute;
          width: 3em;
          height: 3em;
          background-color: #f472b6; /* pink-400 */
          border-top-right-radius: 0.7em;
          border-bottom-right-radius: 0.7em;
          left: 14em;
        }
        
        .line {
          width: 15em;
          height: 0.4em;
          background: rgba(168, 85, 247, 0.2);
          border-radius: 1em;
          position: relative;
          top: 2em;
          animation: line-animation 3s infinite;
        }

        @keyframes pencil-animation {
          0% {
            transform: rotate(155deg) translateY(50px);
          }
          50% {
            transform: rotate(155deg) translateY(-20px) translateX(-50px);
          }
          100% {
            transform: rotate(155deg) translateY(50px);
          }
        }
        @keyframes line-animation {
          0% {
            transform: scaleX(0);
            transform-origin: left;
          }
          45% {
            transform: scaleX(0.6);
            transform-origin: left;
          }
          70%, 100% {
            transform: scaleX(0);
            transform-origin: right;
          }
        }
      `}</style>
    </div>
  );
};
