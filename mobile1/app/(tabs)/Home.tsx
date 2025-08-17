// Home.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Image, PermissionsAndroid } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
// Import Call functionality
import { Linking } from "react-native";
// Import Geolocation
import Geolocation from '@react-native-community/geolocation';

import NavBar from "./NavBar";
import type { RootStackParamList } from "./app"; // ✅ Use shared type from App.tsx

type HomeRouteProp = RouteProp<RootStackParamList, "Home">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

interface UserData {
  ID: string;
  USER: string;
  NAME: string;
  EMAIL: string;
  ADDRESS: string;
  ROLE: string;
  STATUS: string;
  IMAGE?: string | null;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

const Home: React.FC = () => {
  const route = useRoute<HomeRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const username = route.params?.username || "";
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sosLoading, setSosLoading] = useState(false);
  
  // Emergency contacts - you can make this configurable or fetch from backend
  const emergencyContacts = {
    barangay: "+639123456789", // Replace with actual barangay number
  };
  
  // Fetch user data on component mount
  useEffect(() => {
    if (username) {
      fetchUserData();
    }
  }, [username]);
  
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://192.168.100.3:3001/api/user/${username}`);
      
      if (response.data) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);     
    } finally {
      setLoading(false);
    }
  };

  // Request location permission for Android
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "PatrolNet needs access to your location for emergency reports.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  // Get current location
  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Try to get address from coordinates using reverse geocoding
            const address = await reverseGeocode(latitude, longitude);
            resolve({
              latitude,
              longitude,
              address,
            });
          } catch (error) {
            // If reverse geocoding fails, still return coordinates
            resolve({
              latitude,
              longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            });
          }
        },
        (error) => {
          console.error("Location error:", error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  };

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      // You can use a free geocoding service like OpenStreetMap Nominatim
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (response.data && response.data.display_name) {
        return response.data.display_name;
      } else {
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  };

  // Send SOS report to admin
  const sendSOSReport = async (locationData: LocationData) => {
    try {
      const reportData = {
        username: username,
        reporterName: userData?.NAME || username,
        incidentType: "EMERGENCY - SOS",
        description: "EMERGENCY SOS ALERT - Immediate assistance required",
        location: locationData.address || `${locationData.latitude}, ${locationData.longitude}`,
        coordinates: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        },
        priority: "CRITICAL",
        timestamp: new Date().toISOString(),
        status: "PENDING",
      };

      const response = await axios.post(
        "http://192.168.100.3:3001/api/emergency-report",
        reportData
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          "SOS Sent Successfully",
          "Emergency alert has been sent to authorities. Help is on the way.",
          [
            {
              text: "Call Emergency",
              onPress: makeEmergencyCall,
              style: "default",
            },
            {
              text: "OK",
              style: "cancel",
            },
          ]
        );
      } else {
        throw new Error("Failed to send SOS report");
      }
    } catch (error) {
      console.error("Error sending SOS report:", error);
      Alert.alert(
        "SOS Error",
        "Failed to send emergency alert. Please try calling emergency services directly.",
        [
          {
            text: "Call Emergency",
            onPress: makeEmergencyCall,
            style: "default",
          },
          {
            text: "Retry SOS",
            onPress: handleSOSPress,
            style: "default",
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    }
  };

  // Handle SOS button press
  const handleSOSPress = async () => {
    setSosLoading(true);
    
    try {
      // Request location permission
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        Alert.alert(
          "Location Permission Required",
          "Location access is needed to send your emergency location to authorities.",
          [
            {
              text: "Settings",
              onPress: () => {
                if (Platform.OS === 'android') {
                  Linking.openSettings();
                }
              },
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
        setSosLoading(false);
        return;
      }

      // Show confirmation alert
      Alert.alert(
        "Emergency SOS",
        "This will immediately send your location and emergency alert to local authorities. Continue?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setSosLoading(false),
          },
          {
            text: "Send SOS",
            style: "destructive",
            onPress: async () => {
              try {
                // Get current location
                const locationData = await getCurrentLocation();
                
                // Send SOS report
                await sendSOSReport(locationData);
              } catch (locationError) {
                console.error("Location error:", locationError);
                Alert.alert(
                  "Location Error",
                  "Unable to get your current location. Send emergency alert without location?",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Send Without Location",
                      onPress: async () => {
                        await sendSOSReport({
                          latitude: 0,
                          longitude: 0,
                          address: "Location unavailable",
                        });
                      },
                    },
                  ]
                );
              } finally {
                setSosLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("SOS error:", error);
      setSosLoading(false);
      Alert.alert("Error", "Failed to initialize SOS. Please try again.");
    }
  };

  // Function to make emergency call
  const makeEmergencyCall = () => {
    const phoneNumber = emergencyContacts.barangay;
    const url = `tel:${phoneNumber}`;
    
    // Direct call without checking canOpenURL (for better compatibility)
    Linking.openURL(url).catch((err) => {
      console.error('Call Error:', err);
      // Fallback: try alternative formats
      const alternativeUrl = `telprompt:${phoneNumber}`;
      Linking.openURL(alternativeUrl).catch((fallbackErr) => {
        console.error('Fallback Call Error:', fallbackErr);
        Alert.alert("Error", "Unable to open phone dialer. Please call " + phoneNumber + " manually.");
      });
    });
  };

  // Alternative direct call function (bypasses confirmation)
  const makeDirectCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert("Error", "Phone calls are not supported on this device");
        }
      })
      .catch((err) => {
        console.error('Call Error:', err);
        Alert.alert("Error", "Failed to make call");
      });
  };
  
  return (
    <View style={styles.container}>
      <NavBar 
        username={username} 
        userImage={userData?.IMAGE} 
        userRole={userData?.ROLE}
      />

      <View style={styles.body}>
        {/* SOS Button at the top */}
        <TouchableOpacity
          style={[styles.sosButton, sosLoading && styles.sosButtonDisabled]}
          onPress={handleSOSPress}
          activeOpacity={0.8}
          disabled={sosLoading}
        >
          <View style={styles.sosInnerCircle}>
            <Text style={styles.sosText}>SOS</Text>
          </View>
          <Text style={styles.sosSubtext}>
            {sosLoading ? "SENDING..." : "EMERGENCY"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.greeting}>Welcome back, {username}</Text>
        <Text style={styles.subGreeting}>Your community safety network</Text>
        
        <View style={styles.logoContainer}>
          <Image
            source={require('./logo.jpg')} // <-- Replace with your logo path
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>PatrolNet</Text>
          <Text style={styles.tagline}>Community Safety Network</Text>
        </View>
        
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>About PatrolNet</Text>
          <Text style={styles.descriptionText}>
            PatrolNet connects residents with local authorities and emergency services. 
            Report incidents quickly, access emergency contacts instantly, and help keep 
            your community safe through our secure platform.
          </Text>
          
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🚨</Text>
              <Text style={styles.featureText}>Quick Reports</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📞</Text>
              <Text style={styles.featureText}>Emergency Access</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔒</Text>
              <Text style={styles.featureText}>Secure & Private</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => navigation.navigate("IncidentReport", { username })}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>📋</Text>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.reportButtonText}>REPORT INCIDENT</Text>
              <Text style={styles.buttonSubtext}>Document safety concerns</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={makeEmergencyCall}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.emergencyIcon}>🚨</Text>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.emergencyButtonText}>EMERGENCY CALL</Text>
              <Text style={styles.emergencySubtext}>Immediate assistance</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.offlineText}>Connected via cellular network</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  body: {
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  // SOS Button Styles
  sosButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#DC2626",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  sosButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowColor: "#9CA3AF",
  },
  sosInnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  sosText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  sosSubtext: {
    position: "absolute",
    bottom: -25,
    fontSize: 10,
    fontWeight: "700",
    color: "#DC2626",
    letterSpacing: 1,
    textAlign: "center",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40, // Makes the image circular if it's square
    marginBottom: 12,
    backgroundColor: "#3B82F6", // Optional: fallback background
  },
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: "#3B82F6",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    position: "relative",
  },
  logoText: { 
    fontSize: 24, 
    fontWeight: "900", 
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  logoAccent: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 10,
    height: 10,
    backgroundColor: "#10B981",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  title: { 
    fontSize: 28, 
    fontWeight: "900", 
    color: "#1E293B",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  descriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
    marginBottom: 16,
  },
  featuresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
  },
  featureIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textAlign: "center",
  },
  reportButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    width: "100%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emergencyButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    width: "100%",
    marginBottom: 20,
    shadowColor: "#EF4444",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  emergencyIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  buttonTextContainer: {
    flex: 1,
  },
  reportButtonText: {
    fontWeight: "700",
    color: "#1E293B",
    fontSize: 16,
    marginBottom: 2,
  },
  emergencyButtonText: {
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 2,
  },
  buttonSubtext: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  emergencySubtext: {
    fontSize: 12,
    color: "#FEE2E2",
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    backgroundColor: "#10B981",
    borderRadius: 4,
    marginRight: 8,
  },
  offlineText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
});

export default Home;