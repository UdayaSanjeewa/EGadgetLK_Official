'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';

const heroSlides = [
  {
    id: 1,
    title: "Discover Premium Electronics",
    subtitle: "Latest Tech at Your Fingertips",
    description: "Experience cutting-edge technology with our curated collection of premium gadgets and electronics.",
    image: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=1200",
    cta: "Shop Now",
    ctaLink: "/search",
    gradient: "from-blue-600 via-cyan-600 to-blue-700"
  },
  {
    id: 2,
    title: "Exclusive Deals Inside",
    subtitle: "Save Big on Top Brands",
    description: "Unbeatable prices on premium products. Limited time offers you don't want to miss.",
    image: "https://images.pexels.com/photos/1927405/pexels-photo-1927405.jpeg?auto=compress&cs=tinysrgb&w=1200",
    cta: "View Deals",
    ctaLink: "/search",
    gradient: "from-orange-500 via-red-500 to-pink-600"
  },
  {
    id: 3,
    title: "Smart Shopping Experience",
    subtitle: "Fast, Secure & Reliable",
    description: "Shop with confidence. Verified products, secure payments, and fast delivery guaranteed.",
    image: "https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=1200",
    cta: "Explore",
    ctaLink: "/categories",
    gradient: "from-purple-600 via-pink-600 to-red-600"
  }
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <section className="relative min-h-[650px] md:min-h-[700px] lg:min-h-[750px] overflow-hidden bg-gray-900">
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-80`}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50"></div>
        </div>
      ))}

      <div className="relative z-20 h-full min-h-[650px] md:min-h-[700px] lg:min-h-[750px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <div
                key={currentSlide}
                className="space-y-6 animate-fadeInUp"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span className="text-sm font-semibold">Premium Quality Guaranteed</span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                  {heroSlides[currentSlide].title.split(' ').map((word, i) => (
                    <span
                      key={i}
                      className="inline-block animate-fadeInUp"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {word}{' '}
                    </span>
                  ))}
                </h1>

                <p className="text-2xl md:text-3xl font-semibold text-cyan-100">
                  {heroSlides[currentSlide].subtitle}
                </p>

                <p className="text-lg md:text-xl text-white/90 max-w-xl leading-relaxed">
                  {heroSlides[currentSlide].description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={heroSlides[currentSlide].ctaLink}>
                  <Button
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg font-bold rounded-xl shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105 group"
                  >
                    {heroSlides[currentSlide].cta}
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-6 text-lg font-bold rounded-xl bg-transparent backdrop-blur-sm transition-all duration-300"
                  >
                    Browse Categories
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <div className="text-2xl font-bold">10K+</div>
                  <div className="text-xs text-white/80">Products</div>
                </div>
                <div className="text-center p-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <div className="text-2xl font-bold">5K+</div>
                  <div className="text-xs text-white/80">Customers</div>
                </div>
                <div className="text-center p-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <div className="text-2xl font-bold">4.9★</div>
                  <div className="text-xs text-white/80">Rating</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-blue-600" />
                    Why Choose Us?
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl transform hover:scale-105 transition-transform duration-300">
                      <div className="bg-blue-600 p-2 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Best Prices</h4>
                        <p className="text-sm text-gray-600">Competitive pricing on all products</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl transform hover:scale-105 transition-transform duration-300">
                      <div className="bg-green-600 p-2 rounded-lg">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">100% Secure</h4>
                        <p className="text-sm text-gray-600">Protected payments & data</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl transform hover:scale-105 transition-transform duration-300">
                      <div className="bg-orange-600 p-2 rounded-lg">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Fast Delivery</h4>
                        <p className="text-sm text-gray-600">Quick & reliable shipping</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              setIsAutoPlaying(false);
            }}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-12 h-3 bg-white'
                : 'w-3 h-3 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
