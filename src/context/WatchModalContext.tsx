import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Movie, Series } from '../types';
import WatchModal from '../components/modals/WatchModal';

interface WatchModalContextType {
  openWatchModal: (item: Movie | Series) => void;
  closeWatchModal: () => void;
}

const WatchModalContext = createContext<WatchModalContextType | undefined>(undefined);

export function WatchModalProvider({ children }: { children: ReactNode }) {
  const [activeItem, setActiveItem] = useState<(Movie | Series) | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openWatchModal = (item: Movie | Series) => {
    setActiveItem(item);
    setIsOpen(true);
  };

  const closeWatchModal = () => {
    setIsOpen(false);
    setActiveItem(null);
  };

  return (
    <WatchModalContext.Provider value={{ openWatchModal, closeWatchModal }}>
      {children}
      <WatchModal item={activeItem} isOpen={isOpen} onClose={closeWatchModal} />
    </WatchModalContext.Provider>
  );
}

export function useWatchModal() {
  const context = useContext(WatchModalContext);
  if (!context) {
    throw new Error('useWatchModal must be used within a WatchModalProvider');
  }
  return context;
}
