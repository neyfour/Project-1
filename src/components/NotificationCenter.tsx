"use client"

import { useState, useEffect } from "react"
import { Bell, X, CheckCircle, Clock, User } from "lucide-react"
import { useStore } from "../store"

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const notifications = useStore((state) => state.notifications)
  const markNotificationAsRead = useStore((state) => state.markNotificationAsRead)
  const clearNotifications = useStore((state) => state.clearNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id)
  }

  const handleClearAll = () => {
    clearNotifications()
    setIsOpen(false)
  }

  // Close the notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isOpen && !target.closest(".notification-center")) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="notification-center relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 ${notification.read ? "bg-white dark:bg-gray-800" : "bg-blue-50 dark:bg-blue-900/10"}`}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {notification.type === "seller_application" && (
                            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          )}
                          {notification.type === "order_update" && (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          )}
                          {notification.type === "system" && (
                            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                          <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(notification.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="ml-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

