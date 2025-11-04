// utils/useFormFocusAdvanced.js
import { useRef, useCallback } from 'react';
import { Keyboard, findNodeHandle, UIManager } from 'react-native';

export const useFormFocusAdvanced = (onSubmit, scrollRef) => {
  
  const inputRefs = useRef({});

  const registerInput = useCallback((name, ref) => {
    inputRefs.current[name] = ref;
  }, []);

  const focusNextInput = useCallback((currentField, fieldOrder) => {
    const currentIndex = fieldOrder.indexOf(currentField);
    
    if (currentIndex === -1 || currentIndex === fieldOrder.length - 1) {
      // Last field - submit
      Keyboard.dismiss();
      onSubmit?.();
      return;
    }

    const nextField = fieldOrder[currentIndex + 1];
    const nextInput = inputRefs.current[nextField];
    
    if (nextInput) {
      nextInput.focus();
      
      // Optional: Auto-scroll to the input (only if scrollRef is provided)
      if (scrollRef?.current && nextInput.measureLayout) {
        setTimeout(() => {
          try {
            nextInput.measureLayout(
              findNodeHandle(scrollRef.current),
              (x, y, width, height) => {
                scrollRef.current?.scrollTo?.({
                  y: Math.max(0, y - 100), // Offset for better visibility
                  animated: true
                });
              },
              (error) => {
                console.log('Scroll measurement failed:', error);
              }
            );
          } catch (error) {
            console.log('Auto-scroll error:', error);
          }
        }, 100);
      }
    }
  }, [onSubmit, scrollRef]);

  return {
    registerInput,
    focusNextInput,
    inputRefs
  };
};