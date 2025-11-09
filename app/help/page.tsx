'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Search,
  ShoppingCart,
  Package,
  CreditCard,
  Truck,
  RefreshCw
} from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    alert('Thank you for contacting us! We will get back to you soon.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const faqCategories = [
    {
      title: 'Orders & Purchasing',
      icon: ShoppingCart,
      faqs: [
        {
          question: 'How do I place an order?',
          answer: 'To place an order, browse our products, add items to your cart, and proceed to checkout. You will need to create an account or sign in to complete your purchase.'
        },
        {
          question: 'Can I modify or cancel my order?',
          answer: 'You can cancel orders that are still in "pending" status from your orders page. Once an order is confirmed, please contact our support team for assistance.'
        },
        {
          question: 'Do I need an account to make a purchase?',
          answer: 'Yes, you need to create an account to place orders. This helps us provide you with order tracking, purchase history, and better customer service.'
        }
      ]
    },
    {
      title: 'Shipping & Delivery',
      icon: Truck,
      faqs: [
        {
          question: 'How long does delivery take?',
          answer: 'Delivery times vary by location. Typically, orders are delivered within 3-7 business days. You can track your order status in real-time from your orders page.'
        },
        {
          question: 'What are the shipping charges?',
          answer: 'Shipping charges are calculated based on your delivery location and order value. You will see the exact shipping cost during checkout before confirming your order.'
        },
        {
          question: 'Can I change my delivery address?',
          answer: 'You can change your delivery address before the order is shipped. Please contact our support team immediately if you need to update your address.'
        }
      ]
    },
    {
      title: 'Payment & Pricing',
      icon: CreditCard,
      faqs: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept Cash on Delivery (COD), Credit/Debit Cards, and Online Banking. All payment options are available during checkout.'
        },
        {
          question: 'Is my payment information secure?',
          answer: 'Yes, we use industry-standard encryption to protect your payment information. All transactions are processed securely through trusted payment gateways.'
        },
        {
          question: 'Can I get a refund?',
          answer: 'Refund eligibility depends on our return policy and the condition of the product. Please refer to our returns section or contact support for specific cases.'
        }
      ]
    },
    {
      title: 'Returns & Refunds',
      icon: RefreshCw,
      faqs: [
        {
          question: 'What is your return policy?',
          answer: 'We accept returns within 7 days of delivery for most products. Items must be unused, in original condition, and with all tags attached. Some categories may have different policies.'
        },
        {
          question: 'How do I return a product?',
          answer: 'To initiate a return, go to your order history, select the order, and click on the return option. Follow the instructions provided, and our team will guide you through the process.'
        },
        {
          question: 'When will I receive my refund?',
          answer: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method.'
        }
      ]
    },
    {
      title: 'Account & Profile',
      icon: Package,
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Click on the "Sign In" button in the header, then select "Sign Up". Fill in your details including email and password to create your account.'
        },
        {
          question: 'I forgot my password. What should I do?',
          answer: 'On the sign-in page, click "Forgot Password" and enter your email address. You will receive instructions to reset your password.'
        },
        {
          question: 'How do I update my profile information?',
          answer: 'Go to your account dashboard and click on "Profile". You can update your personal information, contact details, and preferences from there.'
        }
      ]
    }
  ];

  const contactOptions = [
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call us at +94 11 234 5678',
      time: 'Mon-Sat, 9:00 AM - 6:00 PM'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@sibnecommerce.com',
      time: 'We reply within 24 hours'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      time: 'Available Mon-Sat, 9:00 AM - 6:00 PM'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How Can We Help You?</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg"
            />
          </div>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-blue-600 font-medium mb-1">{option.description}</p>
                  <p className="text-sm text-gray-500">{option.time}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {faqCategories.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-blue-600" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact Form */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Still Need Help?</CardTitle>
            <p className="text-center text-gray-600">
              Send us a message and we will get back to you as soon as possible
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <Input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <Input
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="How can we help you?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Please describe your issue or question in detail..."
                  rows={6}
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/account/orders">
              <Button variant="outline">My Orders</Button>
            </Link>
            <Link href="/categories">
              <Button variant="outline">Browse Products</Button>
            </Link>
            <Link href="/account">
              <Button variant="outline">My Account</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
