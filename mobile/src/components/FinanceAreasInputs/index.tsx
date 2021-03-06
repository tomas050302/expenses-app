import React, { useState, useRef, Dispatch, SetStateAction } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import EditAreaOverlay from '../EditAreaOverlay';

import generateHeaders from '../../utils/generateAuthHeader';
import api from '../../services/api';

import styles from './styles';

interface Props {
  addNewArea: () => Promise<void>;
  areas: string[];
  editable?: boolean;
  newArea: string;
  removeArea: (index: number) => Promise<void>;
  setAreaEdited: Dispatch<SetStateAction<boolean>>;
  setNewArea: Dispatch<SetStateAction<string>>;
}

const FinanceAreasInputs: React.FC<Props> = ({
  addNewArea,
  areas,
  editable,
  newArea,
  removeArea,
  setAreaEdited,
  setNewArea
}) => {
  const [newAreaOpen, setNewAreaOpen] = useState(false);
  const [isEditAreaOverlayVisible, setIsEditAreaOverlayVisible] = useState(
    false
  );

  const [editingArea, setEditingArea] = useState('');
  const [editingAreaIndex, setEditingAreaIndex] = useState(0);

  const inputRef = useRef<TextInput>(null);

  function handleNewAreaOpen() {
    setNewAreaOpen(state => !state);
  }

  async function handleAddNewArea() {
    await addNewArea();
    setNewAreaOpen(false);
  }

  function editArea(index: number) {
    setEditingAreaIndex(index);
    const currentArea = areas[index];

    setEditingArea(currentArea);
    setIsEditAreaOverlayVisible(true);
  }

  function closeOverlay() {
    setIsEditAreaOverlayVisible(false);
  }

  async function submitArea(index: number) {
    const headers = await generateHeaders();

    const response = await api
      .put(`/areas/${index}`, { area: editingArea }, headers)
      .catch(err => console.log(err));

    if (!response) {
      alert('Error');
      return;
    }

    setAreaEdited(true); // Used to update all user areas
    setIsEditAreaOverlayVisible(false);
  }

  return (
    <>
      <Text style={styles.label}>Your Areas</Text>
      {areas.map((area, index) => (
        <View style={styles.container} key={area}>
          <View style={styles.inputContainer}>
            <Text style={styles.disabledPlaceholder}>{area}</Text>
            {editable && (
              <View style={styles.iconsContainer}>
                <TouchableOpacity onPress={() => editArea(index)}>
                  <Feather name="edit" style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => removeArea(index)}>
                  <Feather name="x" style={styles.cancelIcon} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      ))}

      {newAreaOpen ? (
        <View style={styles.addNewAreaInputContainer}>
          <TextInput
            placeholder="Type a new area"
            ref={inputRef}
            autoCapitalize="words"
            returnKeyType="done"
            onChangeText={setNewArea}
            onSubmitEditing={handleAddNewArea}
            value={newArea}
            style={styles.input}
          />
          <TouchableOpacity onPress={handleAddNewArea}>
            <Feather
              name="plus"
              styles={styles.addNewAreaInputIcon}
              size={18}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleNewAreaOpen}
          style={styles.addNewAreaContainer}
        >
          <Feather name="plus" style={styles.addNewAreaIcon} />
          <Text style={styles.addNewAreaText}>Click to add a new area</Text>
        </TouchableOpacity>
      )}

      <EditAreaOverlay
        closeOverlay={closeOverlay}
        editingArea={editingArea}
        editingAreaIndex={editingAreaIndex}
        submitArea={submitArea}
        setEditingArea={setEditingArea}
        visible={isEditAreaOverlayVisible}
      />
    </>
  );
};

export default FinanceAreasInputs;
