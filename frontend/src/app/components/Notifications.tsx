import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Bell, DollarSign, Calendar, FileText, Info, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Notification } from "../types";

interface NotificationsProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

export function Notifications({ notifications, onMarkAsRead, onMarkAllAsRead }: NotificationsProps) {
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return "bg-blue-50 border-blue-200";
      case "warning":
        return "bg-orange-50 border-orange-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CardTitle>Thông Báo</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="rounded-full">
                  {unreadCount} mới
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="text-white hover:bg-white/20">
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="bg-white">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Không có thông báo nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 transition-all ${
                    notification.isRead
                      ? "bg-white border-gray-200"
                      : `${getTypeColor(notification.type)} border`
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm ${!notification.isRead ? "" : "text-gray-900"}`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <Badge variant="default" className="bg-indigo-600 text-xs">
                            Mới
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">{notification.date}</p>
                        {!notification.isRead && onMarkAsRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1"
                            onClick={() => onMarkAsRead(notification.id)}
                          >
                            Đánh dấu đã đọc
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}