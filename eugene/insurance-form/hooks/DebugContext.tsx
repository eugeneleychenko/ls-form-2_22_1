"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type DebugContextType = {
  isDebugMode: boolean;
  toggleDebugMode: () => void;
};

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }) {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const toggleDebugMode = () => {
    setIsDebugMode(prev => !prev);
  };
  
  // Set mounted state once component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Initial setup to hide debug elements when the app first loads
  useEffect(() => {
    if (!isMounted) return;
    
    // Hide all Airtable references on initial load
    const subElements = document.querySelectorAll('sub');
    const airtableSubElements = Array.from(subElements).filter(element => 
      element.textContent && element.textContent.includes('[Airtable:')
    );
    
    airtableSubElements.forEach(element => {
      element.classList.add('hidden');
    });
    
    // Hide debug elements with class
    const debugLabelsWithClass = document.querySelectorAll('.text-xs.text-gray-500');
    debugLabelsWithClass.forEach(element => {
      element.classList.add('hidden');
    });
  }, [isMounted]);
  
  // Apply debug mode to elements with the debug classes or content
  useEffect(() => {
    if (!isMounted) return;
    
    // Target all elements with these classes, commonly used in basic-information.tsx
    const debugLabelsWithClass = document.querySelectorAll('.text-xs.text-gray-500');
    
    // Target all sub elements that contain Airtable references
    const subElements = document.querySelectorAll('sub');
    const airtableSubElements = Array.from(subElements).filter(element => 
      element.textContent && element.textContent.includes('[Airtable:')
    );
    
    // Target the debug buttons
    const debugButtons = document.querySelectorAll('[data-debug-button]');
    
    // Apply visibility to debug labels with class
    debugLabelsWithClass.forEach(element => {
      if (isDebugMode) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
    });
    
    // Apply visibility to all Airtable sub elements
    airtableSubElements.forEach(element => {
      if (isDebugMode) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
    });
    
    // Apply visibility to debug buttons
    debugButtons.forEach(button => {
      if (isDebugMode) {
        button.classList.remove('hidden');
      } else {
        button.classList.add('hidden');
      }
    });
  }, [isDebugMode, isMounted]);
  
  return (
    <DebugContext.Provider value={{ isDebugMode, toggleDebugMode }}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
} 