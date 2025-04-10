import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Notifications = () => {
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock notification data
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'resume_bought',
      user: {
        name: 'Alex Johnson',
        avatar: require('../assets/images/logo.png'),
      },
      message: 'purchased your "Software Engineer Resume"',
      time: '10 minutes ago',
      read: false,
    },
    {
      id: '2',
      type: 'course_published',
      user: {
        name: 'University of Technology',
        avatar: require('../assets/images/logo.png'),
      },
      message: 'published a new course: "Advanced Machine Learning"',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '3',
      type: 'document_verified',
      user: {
        name: 'EduConnect',
        avatar: require('../assets/images/logo.png'),
      },
      message: 'Your document has been verified successfully',
      time: '1 day ago',
      read: true,
    },
    {
      id: '4',
      type: 'comment',
      user: {
        name: 'Sarah Miller',
        avatar: require('../assets/images/logo.png'),
      },
      message: 'commented on your post: "Great insights! Thanks for sharing."',
      time: '2 days ago',
      read: true,
    },
    {
      id: '5',
      type: 'event_reminder',
      user: {
        name: 'CS Department',
        avatar: require('../assets/images/logo.png'),
      },
      message: 'Reminder: "Career Fair" starts tomorrow at 10 AM',
      time: '2 days ago',
      read: true,
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, you would fetch new notifications here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'resume_bought':
        return <Ionicons name="document-text" size={24} color="#4267B2" />;
      case 'course_published':
        return <Ionicons name="school" size={24} color="#4CAF50" />;
      case 'document_verified':
        return <Ionicons name="checkmark-circle" size={24} color="#2196F3" />;
      case 'comment':
        return <Ionicons name="chatbubble" size={24} color="#FF9800" />;
      case 'event_reminder':
        return <Ionicons name="calendar" size={24} color="#9C27B0" />;
      default:
        return <Ionicons name="notifications" size={24} color="#666" />;
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.iconContainer}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.userInfo}>
          <Image source={item.user.avatar} style={styles.avatar} />
          <View style={styles.textContainer}>
            <Text style={styles.notificationText}>
              <Text style={styles.userName}>{item.user.name} </Text>
              {item.message}
            </Text>
            <Text style={styles.timestamp}>{item.time}</Text>
          </View>
        </View>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4267B2']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 5,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  unreadNotification: {
    backgroundColor: '#EBF5FB',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  notificationContent: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  userName: {
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4267B2',
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default Notifications; 