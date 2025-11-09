import { TrendingUp, Users, Package, CircleCheck as CheckCircle } from 'lucide-react';

const stats = [
  {
    id: 1,
    name: 'Active Listings',
    value: '50,000+',
    icon: Package,
    description: 'Fresh ads posted daily',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    name: 'Happy Customers',
    value: '1M+',
    icon: Users,
    description: 'Satisfied users nationwide',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 3,
    name: 'Successful Deals',
    value: '500K+',
    icon: CheckCircle,
    description: 'Transactions completed',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 4,
    name: 'Monthly Growth',
    value: '25%',
    icon: TrendingUp,
    description: 'Consistent platform growth',
    color: 'from-orange-500 to-red-500'
  }
];

export function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join Sri Lanka's largest and most trusted online marketplace where millions of people buy and sell everyday
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-1 group"
            >
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${stat.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <p className="text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {stat.value}
                </p>
                <h3 className="text-xl font-semibold text-gray-800">
                  {stat.name}
                </h3>
                <p className="text-gray-600">
                  {stat.description}
                </p>
              </div>

              {/* Decorative Element */}
              <div className={`mt-6 h-1 bg-gradient-to-r ${stat.color} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Sellers</h3>
            <p className="text-gray-600">All sellers go through our verification process for your safety</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Package className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assured</h3>
            <p className="text-gray-600">Every listing is reviewed to ensure quality and authenticity</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-gray-600">Our customer support team is always ready to help you</p>
          </div>
        </div>
      </div>
    </section>
  );
}