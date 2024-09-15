import { useEffect, useCallback } from 'react';

interface KeyboardEventOptions {
  triggerOnInput?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

export const useKeyboardEvent = (
  key: string,
  callback: () => void,
  deps: React.DependencyList = [],
  options: KeyboardEventOptions = {}
) => {
  const memoizedCallback = useCallback(callback, [callback, ...deps]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Check if the active element is an input or textarea
      const isInputActive = document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement;

      // Only trigger the callback if it's not an input/textarea or if we explicitly allow it
      if ((!isInputActive || options.triggerOnInput) && event.key === key) {
        if (options.ctrlKey && !event.ctrlKey) return;
        if (options.shiftKey && !event.shiftKey) return;
        if (options.altKey && !event.altKey) return;
        if (options.metaKey && !event.metaKey) return;

        event.preventDefault();
        memoizedCallback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [key, memoizedCallback, options]);
};