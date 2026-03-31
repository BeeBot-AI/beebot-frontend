import React, { createContext, useContext, useState, useEffect } from 'react';

const TourContext = createContext();

export const useTour = () => {
    return useContext(TourContext);
};

export const TourProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [hasCompletedTour, setHasCompletedTour] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('beebot_tour_completed');
        if (stored === 'true') {
            setHasCompletedTour(true);
        }
    }, []);

    const startTour = () => {
        setIsActive(true);
        setCurrentStep(0);
    };

    const nextStep = () => {
        setCurrentStep((prev) => prev + 1);
    };

    const endTour = () => {
        setIsActive(false);
        setHasCompletedTour(true);
        localStorage.setItem('beebot_tour_completed', 'true');
    };

    const value = {
        isActive,
        currentStep,
        hasCompletedTour,
        startTour,
        nextStep,
        endTour
    };

    return (
        <TourContext.Provider value={value}>
            {children}
        </TourContext.Provider>
    );
};
