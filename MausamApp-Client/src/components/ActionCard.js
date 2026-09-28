import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ActionCard = ({ title, instruction, type }) => {
  // Dynamic styling based on the type of instruction
  let borderColor = '#3498db'; // info
  let bgColor = '#ebf5fb';

  if (type === 'warning') {
    borderColor = '#e74c3c';
    bgColor = '#fdedec';
  } else if (type === 'success') {
    borderColor = '#2ecc71';
    bgColor = '#eaeded';
  }

  return (
    <View style={[styles.card, { borderColor, backgroundColor: bgColor }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.instruction}>{instruction}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 5,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  instruction: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  }
});

export default ActionCard;
