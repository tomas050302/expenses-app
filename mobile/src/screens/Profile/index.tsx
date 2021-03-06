import React, { useState, useEffect } from 'react';

import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { Extrapolate, interpolate } from 'react-native-reanimated';
import CustomAlert from '../../components/CustomAlert';
import EditableInput from '../../components/EditableInput';
import Header from '../../components/Header';
import FinanceAreasInputs from '../../components/FinanceAreasInputs';

import api from '../../services/api';
import useOpenKeyboard from '../../hooks/useOpenKeyboard';
import generateHeaders from '../../utils/generateAuthHeader';

import theme from '../../styles';
import styles from './styles';

interface AlertProps {
  type: 'success' | 'warning' | 'undo' | 'error' | '' | undefined;
  customMessage?: string;
}

const Profile: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [occupation, setOccupation] = useState<string | undefined>('');
  const [birth, setBirth] = useState<string | undefined>('');
  const [phone, setPhone] = useState<string | undefined>('');
  const [defaultCurrency, setDefaultCurrency] = useState<string | undefined>(
    ''
  );

  const [newArea, setNewArea] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [areasHistory, setAreasHistory] = useState<string[][]>([[]]);

  const [editing, setEditing] = useState(false);
  const [areaEdited, setAreaEdited] = useState(false);

  const [alertType, setAlertType] = useState<AlertProps>({
    type: ''
  });

  const keyboardOpen = useOpenKeyboard();

  const y = new Animated.Value(0);
  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y } } }], {
    useNativeDriver: true
  });

  const scale: any = interpolate(y, {
    inputRange: [0, theme.constants.DEADZONE_HEIGHT],
    outputRange: [1, 0],
    extrapolateRight: Extrapolate.CLAMP
  });

  const translate = interpolate(y, {
    inputRange: [0, theme.constants.DEADZONE_HEIGHT],
    outputRange: [0, -theme.constants.DEADZONE_HEIGHT / 2],
    extrapolateRight: Extrapolate.CLAMP
  });

  async function getUserInfo() {
    const headers = await generateHeaders();
    const response = await api.get('/user', headers);

    const { data } = response;

    setFirstName(data.firstName);
    setLastName(data.lastName);
    setOccupation(data.occupation);
    setBirth(data.birth?.toString());
    setPhone(data.phone);
    setDefaultCurrency(data.financeSettings.defaultCurrency);
  }

  async function handleEditProfile() {
    if (editing) {
      const headers = await generateHeaders();

      const data = {
        firstName,
        lastName,
        occupation,
        birth,
        phone,
        financeSettings: { defaultCurrency, areas }
      };

      const response = await api.put('/user', data, headers);

      if (!response) {
        setAlertType({ type: 'error' });
      } else {
        setAlertType({
          type: 'success',
          customMessage: 'User updated with success!'
        });
      }
    }

    setEditing(state => !state);
  }

  async function handleAddNewArea() {
    if (newArea === '') {
      setAlertType({
        type: 'error',
        customMessage: 'The new area must have a name.'
      });
      return;
    }

    const headers = await generateHeaders();
    await api
      .post(
        '/areas',
        {
          area: newArea
        },
        headers
      )
      .catch(err => {
        console.log(err);
        setAlertType({ type: 'warning' });
      });

    setAlertType({ type: 'success', customMessage: 'Area added with success' });

    setNewArea('');
  }

  async function getUserAreas() {
    const headers = await generateHeaders();

    const { data } = await api.get('/areas', headers);

    setAreasHistory([data]);
  }

  async function removeArea(index: number) {
    const tempAreas = areas.filter(
      (area, areaIndex) => areaIndex !== index && area
    );

    setAreasHistory([...areasHistory, tempAreas]); // Remove area visually

    setAlertType({ type: 'undo' });
  }

  function undoRemoveArea() {
    const undoAreasHistoryArray = areasHistory.slice(0, -1);

    setAreasHistory(undoAreasHistoryArray);
  }

  useEffect(() => {
    getUserInfo();
  }, []);

  useEffect(() => {
    if (newArea === '') {
      getUserAreas();
      setAreaEdited(false);
    }
  }, [newArea, areaEdited]);

  useEffect(() => {
    setAreas(areasHistory[areasHistory.length - 1]);
  }, [areasHistory]);

  return (
    <View style={styles.container}>
      <Header confirmMessage={editing} title="Profile" />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        style={styles.mainScroll}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {!keyboardOpen && (
          <View style={styles.scrollContent}>
            <Animated.Image
              source={{ uri: 'http://www.github.com/tomas050302.png' }}
              style={[
                styles.avatar,
                { opacity: scale, transform: [{ scale }] }
              ]}
            />
            <View style={styles.userInformationContainer}>
              <Animated.Text
                style={[
                  styles.username,
                  {
                    opacity: scale,
                    transform: [{ scale, translateY: translate }]
                  }
                ]}
              >
                {firstName} {lastName}
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.occupation,
                  {
                    opacity: scale,
                    transform: [{ scale, translateY: translate }]
                  }
                ]}
              >
                {occupation}
              </Animated.Text>
            </View>
          </View>
        )}

        <View style={styles.personalInfoContainer}>
          <Text style={styles.headerText}>Personal Info</Text>
          <View style={styles.spacer} />
          <EditableInput
            editable={editing}
            placeholder="First Name"
            onChangeText={setFirstName}
            value={firstName}
          />
          <EditableInput
            editable={editing}
            placeholder="Last Name"
            onChangeText={setLastName}
            value={lastName}
          />
          <EditableInput
            editable={editing}
            placeholder="Occupation"
            onChangeText={setOccupation}
            value={occupation}
          />
          <EditableInput
            editable={editing}
            placeholder="Birth"
            onChangeText={setBirth}
            value={birth}
          />
          <EditableInput
            editable={editing}
            placeholder="Phone"
            onChangeText={setPhone}
            value={phone}
          />
          <Text style={styles.headerText}>Finance Settings</Text>
          <View style={styles.spacer} />
          <EditableInput
            editable={editing}
            placeholder="Default Currency"
            onChangeText={setDefaultCurrency}
            value={defaultCurrency}
          />
          <FinanceAreasInputs
            addNewArea={handleAddNewArea}
            areas={areas}
            editable={editing}
            newArea={newArea}
            removeArea={removeArea}
            setNewArea={setNewArea}
            setAreaEdited={setAreaEdited}
          />

          {editing ? (
            <TouchableOpacity
              onPress={handleEditProfile}
              style={[styles.button, styles.saveButton]}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleEditProfile} style={styles.button}>
              <Animated.Text style={[styles.buttonText]}>
                edit information
              </Animated.Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.ScrollView>
      <CustomAlert props={alertType} undoFunction={undoRemoveArea} />
    </View>
  );
};

export default Profile;
