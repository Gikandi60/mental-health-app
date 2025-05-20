import Link from 'next/link';
import { FiMessageSquare, FiBarChart2, FiShield, FiHeart } from 'react-icons/fi';

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  desc: string;
};

type MotivationCardProps = {
  quote: string;
};

type ResourceCardProps = {
  title: string;
  desc: string;
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">Mental Health Support </h1>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">
              Log In
            </Link>
            <Link href="/chat" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-100 to-white py-20 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              You Are Not Alone
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Get safe, compassionate AI-powered support whenever you need to talk or reflect.
            </p>
            <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700">
              Get Started
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-10">
              Features for Your Peace of Mind
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <FeatureCard
                icon={<FiMessageSquare className="text-blue-600 w-6 h-6" />}
                title="Supportive Conversations"
                desc="Talk to an AI assistant trained to respond with empathy and guidance."
              />
              <FeatureCard
                icon={<FiBarChart2 className="text-green-600 w-6 h-6" />}
                title="Mood Tracking"
                desc="Track your emotions and identify patterns in your mental health."
              />
              <FeatureCard
                icon={<FiShield className="text-purple-600 w-6 h-6" />}
                title="Private & Secure"
                desc="All chats are confidential and encrypted for your safety."
              />
            </div>
          </div>
        </section>

        {/* Motivational Cards */}
        <section className="bg-blue-100 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-10">
              Uplifting Words to Keep You Going
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <MotivationCard quote="You are stronger than you think." />
              <MotivationCard quote="Every day is a fresh start." />
              <MotivationCard quote="It’s okay to ask for help." />
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-10">
              Resources in Kenya
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResourceCard
                title="Amani Counselling Centre"
                desc="Offers free and low-cost therapy sessions across Kenya."
              />
              <ResourceCard
                title="Kenya Red Cross Mental Health Helpline"
                desc="Toll-Free: 1199. Available 24/7 for emergencies and support."
              />
              <ResourceCard
                title="Chiromo Hospital Group"
                desc="Provides psychiatric services in Nairobi and beyond."
              />
              <ResourceCard
                title="Befrienders Kenya"
                desc="Provides emotional support to people feeling distressed or suicidal."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 text-white py-12">
          <div className="text-center max-w-2xl mx-auto px-4">
            <h3 className="text-3xl font-bold mb-4">Ready to Begin?</h3>
            <p className="mb-6 text-blue-100">
              Start your healing journey today with tools, guidance, and support made for you.
            </p>
            <Link href="/register" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-100">
              Create Your Account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">Mental Health Support</h2>
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} All rights reserved</p>
          </div>
          <p className="text-sm text-gray-400 text-center md:text-right">
            Not a substitute for medical advice. In an emergency, call 1199 or your local hospital.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Components
function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-center">
      <div className="w-12 h-12 mx-auto flex items-center justify-center bg-blue-100 rounded-full mb-4">
        {icon}
      </div>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}

function MotivationCard({ quote }: MotivationCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow text-lg font-semibold text-blue-700">
      <FiHeart className="mx-auto mb-4 text-red-500 w-6 h-6" />
      “{quote}”
    </div>
  );
}

function ResourceCard({ title, desc }: ResourceCardProps) {
  return (
    <div className="bg-blue-50 p-5 rounded-lg shadow border-l-4 border-blue-600">
      <h4 className="text-lg font-bold text-blue-800 mb-2">{title}</h4>
      <p className="text-gray-700">{desc}</p>
    </div>
  );
}
