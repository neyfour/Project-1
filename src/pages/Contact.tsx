"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react"
import toast from "react-hot-toast"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Your message has been sent successfully!")
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions or need assistance? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="How can we help you?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Tell us how we can assist you..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">support@matrixcommerce.com</p>
                    <p className="text-gray-600 dark:text-gray-400">sales@matrixcommerce.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Phone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Phone</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">+1 (555) 123-4567</p>
                    <p className="text-gray-600 dark:text-gray-400">+1 (555) 987-6543</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Address</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">123 Sports Avenue, Athletic City</p>
                    <p className="text-gray-600 dark:text-gray-400">California, 90210, United States</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Business Hours</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Monday - Friday</h3>
                    <p className="text-gray-600 dark:text-gray-400">9:00 AM - 6:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Saturday</h3>
                    <p className="text-gray-600 dark:text-gray-400">10:00 AM - 4:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sunday</h3>
                    <p className="text-gray-600 dark:text-gray-400">Closed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-sm p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Need Immediate Help?</h2>
              </div>
              <p className="mb-6">Our customer support team is available for live chat during business hours.</p>
              <button className="w-full py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
                Start Live Chat
              </button>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 h-96">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d423286.27405770525!2d-118.69192047471653!3d34.02016130653294!2m3!1 f3!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c75ddc27da13%3A0xe22fdf6f254608f4!2sLos%20Angeles%2C%20CA%2C%20USA!5e0!3m2!1sen!2s!4v1620176017896!5m2!1sen!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="Map"
            className="rounded-lg"
          ></iframe>
        </div>
      </div>
    </div>
  )
}

