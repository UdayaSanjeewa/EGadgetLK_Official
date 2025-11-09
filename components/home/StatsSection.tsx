'use client';

import { TrendingUp, Users, Package, Shield, Star, Award, Zap } from 'lucide-react';

const stats = [
  {
    id: 1,
    name: 'Products',
    value: '10,000+',
    icon: Package,
    description: 'Premium quality items',
    color: 'from-blue-600 to-cyan-500'
  },
  {
    id: 2,
    name: 'Customers',
    value: '5,000+',
    icon: Users,
    description: 'Happy shoppers',
    color: 'from-green-600 to-emerald-500'
  },
  {
    id: 3,
    name: 'Rating',
    value: '4.9/5',
    icon: Star,
    description: 'Customer satisfaction',
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 4,
    name: 'Growth',
    value: '30%',
    icon: TrendingUp,
    description: 'Monthly increase',
    color: 'from-purple-600 to-pink-500'
  }
];

const features = [
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'All transactions are 100% secure and encrypted',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    icon: Zap,
    title: 'Fast Delivery',
    description: 'Quick and reliable shipping nationwide',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Only the best products make it to our store',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  }
];

export function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-4">
            <Award className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-600">Why Choose Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our growing community of satisfied customers shopping premium electronics
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className="relative group"
              style={{
                animation: `fadeInScale 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-transparent transform hover:-translate-y-2">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>

                <p className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {stat.value}
                </p>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {stat.name}
                </h3>
                <p className="text-xs text-gray-600">
                  {stat.description}
                </p>

                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl`}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-1 shadow-2xl">
          <div className="bg-white rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="text-center group cursor-pointer"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${(index + 0.5) * 0.2}s both`
                  }}
                >
                  <div className={`inline-flex p-5 rounded-2xl ${feature.bgColor} mb-4 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
