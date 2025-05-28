
"use client";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import type { HeroBannerSlide } from '@/lib/types';
import { HERO_BANNERS_STORAGE_KEY, DEFAULT_HERO_BANNER_SLIDES } from '@/lib/constants';

interface HeroBannerProps {
  slides?: HeroBannerSlide[]; // Optional prop for category-specific slides
}

export function HeroBanner({ slides: categorySpecificSlides }: HeroBannerProps) {
  const [globalSlidesFromStorage] = useLocalStorage<HeroBannerSlide[]>(
    HERO_BANNERS_STORAGE_KEY,
    DEFAULT_HERO_BANNER_SLIDES
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slidesToUse = useMemo(() => {
    const activeCategorySlides = categorySpecificSlides?.filter(slide => slide.isActive);
    if (activeCategorySlides && activeCategorySlides.length > 0) {
      return activeCategorySlides;
    }
    return globalSlidesFromStorage.filter(slide => slide.isActive);
  }, [categorySpecificSlides, globalSlidesFromStorage]);


  useEffect(() => {
    if (slidesToUse.length === 0) return;
    const timer = setTimeout(() => {
      setCurrentSlideIndex((prevSlide) => (prevSlide + 1) % slidesToUse.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearTimeout(timer);
  }, [currentSlideIndex, slidesToUse.length]);

  // Reset index if slidesToUse changes and current index is out of bounds
  useEffect(() => {
    if (currentSlideIndex >= slidesToUse.length) {
      setCurrentSlideIndex(0);
    }
  }, [slidesToUse, currentSlideIndex]);


  if (slidesToUse.length === 0) {
    return (
        <div className="w-full my-4 md:my-6">
            <div className="container mx-auto px-0 md:px-4">
                <Card className="overflow-hidden shadow-lg relative bg-muted text-muted-foreground aspect-[16/6] md:aspect-[16/5]">
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-8">
                        <h2 className="text-xl md:text-2xl font-semibold">No active banners</h2>
                        <p className="text-sm md:text-base">Configure banners in admin settings or for this category.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
  }

  const slide = slidesToUse[currentSlideIndex];
  const prevSlide = () => setCurrentSlideIndex((currentSlideIndex - 1 + slidesToUse.length) % slidesToUse.length);
  const nextSlide = () => setCurrentSlideIndex((currentSlideIndex + 1) % slidesToUse.length);

  return (
    <div className="w-full my-4 md:my-6">
      <div className="container mx-auto px-0 md:px-4">
        <Card className={`overflow-hidden shadow-lg relative ${slide.bgColor || 'bg-primary'} ${slide.textColor || 'text-primary-foreground'}`}>
          <div className="aspect-[16/6] md:aspect-[16/5] w-full relative">
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              priority={currentSlideIndex === 0} // Prioritize first image
              className="object-cover"
              data-ai-hint={slide.imageHint}
            />
            <div className="absolute inset-0 bg-black/30"></div> {/* Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-8">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold drop-shadow-md mb-2 md:mb-4">{slide.title}</h2>
              <p className="text-sm md:text-lg lg:text-xl mb-4 md:mb-6 max-w-xl drop-shadow-sm">{slide.description}</p>
              <Button asChild size="lg" variant="secondary" className="bg-opacity-90 hover:bg-opacity-100">
                <Link href={slide.buttonLink || '#'}>
                  {slide.buttonText} <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
          {/* Manual Dots for navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {slidesToUse.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlideIndex(index)}
                className={`h-2 w-2 rounded-full ${currentSlideIndex === index ? (slide.textColor === 'text-white' ? 'bg-white' : 'bg-primary') : (slide.textColor === 'text-white' ? 'bg-white/50' : 'bg-primary/50')} transition-all`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          {/* Prev/Next Buttons */}
          {slidesToUse.length > 1 && (
            <>
              <Button variant="ghost" size="icon" onClick={prevSlide} className={`absolute left-2 top-1/2 -translate-y-1/2 ${slide.textColor || 'text-primary-foreground'} hover:bg-black/20`}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextSlide} className={`absolute right-2 top-1/2 -translate-y-1/2 ${slide.textColor || 'text-primary-foreground'} hover:bg-black/20`}>
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
