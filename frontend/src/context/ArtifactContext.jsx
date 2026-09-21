import React, { createContext, useContext, useState, useCallback } from 'react';

const ArtifactContext = createContext(null);

export function ArtifactProvider({ children }) {
  // Session-only artifacts state
  // TODO: Future persistence via localStorage or backend user profile sync
  const [artifacts, setArtifacts] = useState([]);
  const [activeArtifactId, setActiveArtifactId] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const addArtifact = useCallback((newArtifact) => {
    if (!newArtifact || !newArtifact.markdown) return null;

    const id = newArtifact.id || `art-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const artifactObj = {
      id,
      type: newArtifact.type || 'report', // 'report' | 'table' | 'pdf'
      title: (newArtifact.title || 'Medical Report').trim(),
      markdown: newArtifact.markdown,
      createdAt: newArtifact.createdAt || new Date().toISOString()
    };

    setArtifacts((prev) => {
      // Check if duplicate title exists in session, replace if so to update content
      const existingIdx = prev.findIndex((a) => a.title.toLowerCase() === artifactObj.title.toLowerCase());
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], ...artifactObj, id: updated[existingIdx].id };
        return updated;
      }
      return [...prev, artifactObj];
    });

    setActiveArtifactId(id);
    setIsPanelOpen(true);
    return id;
  }, []);

  const setActiveArtifact = useCallback((id) => {
    setActiveArtifactId(id);
    setIsPanelOpen(true);
  }, []);

  const removeArtifact = useCallback((id) => {
    setArtifacts((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      if (remaining.length === 0) {
        setActiveArtifactId(null);
        setIsPanelOpen(false);
      } else if (activeArtifactId === id) {
        setActiveArtifactId(remaining[remaining.length - 1].id);
      }
      return remaining;
    });
  }, [activeArtifactId]);

  const clearArtifacts = useCallback(() => {
    setArtifacts([]);
    setActiveArtifactId(null);
    setIsPanelOpen(false);
    setIsFullscreen(false);
  }, []);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    setIsFullscreen(false);
  }, []);

  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const currentArtifact = artifacts.find((a) => a.id === activeArtifactId) || artifacts[artifacts.length - 1] || null;

  return (
    <ArtifactContext.Provider
      value={{
        artifacts,
        activeArtifactId,
        currentArtifact,
        isPanelOpen,
        isFullscreen,
        addArtifact,
        setActiveArtifact,
        removeArtifact,
        clearArtifacts,
        openPanel,
        closePanel,
        togglePanel,
        toggleFullscreen
      }}
    >
      {children}
    </ArtifactContext.Provider>
  );
}

export function useArtifact() {
  const context = useContext(ArtifactContext);
  if (!context) {
    throw new Error('useArtifact must be used within an ArtifactProvider');
  }
  return context;
}

export default ArtifactContext;
