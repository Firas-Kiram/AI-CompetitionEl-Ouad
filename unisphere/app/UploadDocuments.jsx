import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    StatusBar,
    SafeAreaView,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const DocumentUpload = ({ route }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const navigation = useNavigation();

    // Extract userData from route.params
    const { userData } = route.params || {};
    if (!userData) {
        Alert.alert('Error', 'User data is missing. Please go back and try again.');
        return null; // Prevent rendering the rest of the component
    }

    const userRole = userData.type || 'student'; // Use the role from userData

    const handleOpenCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera access is required to take a photo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setFile(result.assets[0].uri);
        }
    };

    const handlePickFile = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Media library access is required to pick a file.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setFile(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            Alert.alert('Error', 'Please upload a document before proceeding.');
            return;
        }

        setIsUploading(true);

        try {
            // Prepare the data to send to the server
            const userPayload = {
                email: userData.email,
                password: userData.password,
                firstname: userData.firstname,
                lastname: userData.lastname,
                phoneNumber: userData.phoneNumber,
                type: userData.type,
            };

            // Make the POST request
            const response = await axios.post('http://192.168.168.28:3000/users', userPayload);

            console.log('User created successfully:', response.data);
            Alert.alert(
                'Success', 
                'Account created successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login')
                    }
                ]
            );

        } catch (error) {
            console.error('Error creating user:', error);

            // Handle different error scenarios
            if (error.response) {
                Alert.alert('Error', error.response.data.message || 'Registration failed');
            } else if (error.request) {
                Alert.alert('Error', 'No response from server. Please check your connection.');
            } else {
                Alert.alert('Error', 'An error occurred. Please try again.');
            }
        } finally {
            setIsUploading(false);
        }
    };

    const guidanceText =
        userRole === 'student'
            ? 'Please upload a government‑issued ID and a scholarship certificate (JPEG/PNG/PDF).'
            : 'Please upload a government‑issued ID and proof of employment as a teacher (JPEG/PNG/PDF).';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#007aff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Document Verification</Text>
                    <View style={styles.placeholder} />
                </View>

                <View style={styles.stepIndicator}>
                    <View style={styles.stepComplete}>
                        <Text style={styles.stepText}>1</Text>
                    </View>
                    <View style={styles.stepLine} />
                    <View style={styles.stepActive}>
                        <Text style={styles.stepText}>2</Text>
                    </View>
                    <View style={styles.stepLine} />
                    <View style={styles.stepIncomplete}>
                        <Text style={styles.stepText}>3</Text>
                    </View>
                </View>

                <Text style={styles.guidance}>{guidanceText}</Text>

                <View style={styles.uploadArea}>
                    {file ? (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: file }} style={styles.previewImage} />
                            <TouchableOpacity
                                style={styles.replaceButton}
                                onPress={() => setFile(null)}
                            >
                                <Ionicons name="refresh-outline" size={20} color="#fff" />
                                <Text style={styles.replaceButtonText}>Replace</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.uploadPlaceholder}>
                            <Ionicons name="cloud-upload-outline" size={60} color="#007aff" />
                            <Text style={styles.uploadText}>Upload your documents</Text>
                            <Text style={styles.uploadSubtext}>Tap to choose a method</Text>
                        </View>
                    )}
                </View>

                {!file && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={styles.uploadButton} 
                            onPress={handleOpenCamera}
                        >
                            <Ionicons name="camera-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.uploadButton} 
                            onPress={handlePickFile}
                        >
                            <Ionicons name="folder-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Gallery</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.submitButton, !file && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={!file || isUploading}
                >
                    {isUploading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    placeholder: {
        width: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    stepComplete: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#4cd964',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepActive: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#007aff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepIncomplete: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: '#e0e0e0',
    },
    stepText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    guidance: {
        fontSize: 16,
        color: '#555',
        marginBottom: 25,
        textAlign: 'center',
        lineHeight: 22,
    },
    uploadArea: {
        minHeight: 200,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden',
    },
    uploadPlaceholder: {
        alignItems: 'center',
        padding: 30,
    },
    uploadText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 12,
    },
    uploadSubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    uploadButton: {
        flexDirection: 'row',
        backgroundColor: '#007aff',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 0.48,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    previewContainer: {
        width: '100%',
        alignItems: 'center',
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: 250,
        borderRadius: 8,
    },
    replaceButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    replaceButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 5,
    },
    submitButton: {
        backgroundColor: '#007aff',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#007aff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    disabledButton: {
        backgroundColor: '#cccccc',
        shadowOpacity: 0,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default DocumentUpload;