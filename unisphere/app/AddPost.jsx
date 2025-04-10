import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

// API base URL - replace with your actual server URL when deploying
const API_BASE_URL = 'http://localhost:3000/api';

const AddPost = () => {
  const navigation = useNavigation();
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacy, setPrivacy] = useState('public'); // 'public', 'university', 'faculty', 'private'
  const [showPrivacyOptions, setShowPrivacyOptions] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([
    { id: '1', name: 'Academics' },
    { id: '2', name: 'Events' },
    { id: '3', name: 'Campus Life' },
    { id: '4', name: 'Research' },
    { id: '5', name: 'Projects' },
    { id: '6', name: 'Internships' },
    { id: '7', name: 'Jobs' },
    { id: '8', name: 'Technology' },
    { id: '9', name: 'Arts' },
    { id: '10', name: 'Sports' }
  ]);

  // Request camera and media library permissions on component mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
          Alert.alert('Permission required', 'Camera and media library permissions are needed to upload images');
        }
      }
    })();
  }, []);

  // Pick image from library
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
  };

  // Toggle topic selection
  const toggleTopic = (topicId) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter(id => id !== topicId));
    } else {
      if (selectedTopics.length < 3) { // Limit to 3 topics
        setSelectedTopics([...selectedTopics, topicId]);
      } else {
        Alert.alert('Limit Reached', 'You can select up to 3 topics');
      }
    }
  };

  // Submit post
  const handleSubmitPost = async () => {
    if (postContent.trim() === '') {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data with image if selected
      const formData = new FormData();
      formData.append('content', postContent);
      formData.append('privacy', privacy);
      
      // Add selected topics
      selectedTopics.forEach(topicId => {
        formData.append('topics[]', topicId);
      });

      if (selectedImage) {
        const filename = selectedImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('image', {
          uri: selectedImage,
          name: filename,
          type
        });
      }

      // In a real app, send to your API
      // const response = await axios.post(`${API_BASE_URL}/posts`, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //     'Authorization': `Bearer ${yourAuthToken}`
      //   }
      // });

      // For development, just simulate success after a delay
      setTimeout(() => {
        // Success handling
        setIsSubmitting(false);
        Alert.alert('Success', 'Your post has been published!');
        
        // Reset form and navigate back
        setPostContent('');
        setSelectedImage(null);
        setPrivacy('public');
        setSelectedTopics([]);
        
        navigation.navigate('Feed');
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting post:', error);
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to submit post. Please try again.');
    }
  };

  // Get privacy icon and text
  const getPrivacyDetails = () => {
    switch(privacy) {
      case 'public':
        return { icon: 'earth', text: 'Anyone' };
      case 'university':
        return { icon: 'school', text: 'University' };
      case 'faculty':
        return { icon: 'account-group', text: 'Faculty' };
      case 'private':
        return { icon: 'lock', text: 'Only Me' };
      default:
        return { icon: 'earth', text: 'Anyone' };
    }
  };

  const privacyDetails = getPrivacyDetails();

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          style={[
            styles.postButton, 
            (postContent.trim() === '' && !selectedImage) ? styles.postButtonDisabled : {}
          ]}
          disabled={isSubmitting || (postContent.trim() === '' && !selectedImage)}
          onPress={handleSubmitPost}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* User info */}
        <View style={styles.userInfo}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.userAvatar} 
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>John Doe</Text>
            <TouchableOpacity 
              style={styles.privacySelector}
              onPress={() => setShowPrivacyOptions(!showPrivacyOptions)}
            >
              <Icon name={privacyDetails.icon} size={16} color="#666" />
              <Text style={styles.privacyText}>{privacyDetails.text}</Text>
              <Icon name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy options dropdown */}
        {showPrivacyOptions && (
          <View style={styles.privacyOptions}>
            <TouchableOpacity 
              style={styles.privacyOption}
              onPress={() => {
                setPrivacy('public');
                setShowPrivacyOptions(false);
              }}
            >
              <Icon name="earth" size={20} color="#666" />
              <View style={styles.privacyOptionTextContainer}>
                <Text style={styles.privacyOptionTitle}>Anyone</Text>
                <Text style={styles.privacyOptionDescription}>Anyone on UniSphere</Text>
              </View>
              {privacy === 'public' && <Icon name="check" size={20} color="#0A66C2" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.privacyOption}
              onPress={() => {
                setPrivacy('university');
                setShowPrivacyOptions(false);
              }}
            >
              <Icon name="school" size={20} color="#666" />
              <View style={styles.privacyOptionTextContainer}>
                <Text style={styles.privacyOptionTitle}>University</Text>
                <Text style={styles.privacyOptionDescription}>People from your university</Text>
              </View>
              {privacy === 'university' && <Icon name="check" size={20} color="#0A66C2" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.privacyOption}
              onPress={() => {
                setPrivacy('faculty');
                setShowPrivacyOptions(false);
              }}
            >
              <Icon name="account-group" size={20} color="#666" />
              <View style={styles.privacyOptionTextContainer}>
                <Text style={styles.privacyOptionTitle}>Faculty</Text>
                <Text style={styles.privacyOptionDescription}>People from your faculty</Text>
              </View>
              {privacy === 'faculty' && <Icon name="check" size={20} color="#0A66C2" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.privacyOption}
              onPress={() => {
                setPrivacy('private');
                setShowPrivacyOptions(false);
              }}
            >
              <Icon name="lock" size={20} color="#666" />
              <View style={styles.privacyOptionTextContainer}>
                <Text style={styles.privacyOptionTitle}>Only Me</Text>
                <Text style={styles.privacyOptionDescription}>Only you can see this post</Text>
              </View>
              {privacy === 'private' && <Icon name="check" size={20} color="#0A66C2" />}
            </TouchableOpacity>
          </View>
        )}

        {/* Post content input */}
        <TextInput
          style={styles.postInput}
          placeholder="What's on your mind?"
          placeholderTextColor="#999"
          multiline
          value={postContent}
          onChangeText={setPostContent}
          autoFocus={false}
        />

        {/* Selected image preview */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
              <Icon name="close-circle" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Topics selection */}
        <Text style={styles.sectionTitle}>Topics (up to 3)</Text>
        <View style={styles.topicsContainer}>
          {availableTopics.map(topic => (
            <TouchableOpacity
              key={topic.id}
              style={[
                styles.topicButton,
                selectedTopics.includes(topic.id) && styles.topicButtonSelected
              ]}
              onPress={() => toggleTopic(topic.id)}
            >
              <Text 
                style={[
                  styles.topicButtonText,
                  selectedTopics.includes(topic.id) && styles.topicButtonTextSelected
                ]}
              >
                {topic.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spacer for bottom padding */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Media options at bottom */}
      <View style={styles.mediaOptions}>
        <Text style={styles.addToYourPost}>Add to your post</Text>
        <View style={styles.mediaButtons}>
          <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
            <Icon name="image" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
            <Icon name="camera" size={24} color="#FF5722" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton}>
            <Icon name="file-document" size={24} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton}>
            <Icon name="map-marker" size={24} color="#F44336" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton}>
            <Icon name="poll" size={24} color="#9C27B0" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postButton: {
    backgroundColor: '#0A66C2',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userDetails: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  privacySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 15,
  },
  privacyText: {
    fontSize: 12,
    marginHorizontal: 5,
    color: '#666',
  },
  privacyOptions: {
    marginHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 15,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  privacyOptionTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  privacyOptionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  privacyOptionDescription: {
    fontSize: 12,
    color: '#666',
  },
  postInput: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  topicButton: {
    backgroundColor: '#F0F2F5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  topicButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#0A66C2',
  },
  topicButtonText: {
    fontSize: 14,
    color: '#666',
  },
  topicButtonTextSelected: {
    color: '#0A66C2',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 100,
  },
  mediaOptions: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
  },
  addToYourPost: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mediaButton: {
    padding: 10,
  },
});

export default AddPost; 