import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BookNote as BookNoteType } from '@/types/book';
import { bookStyles } from '@/styles/book';
import { useColors } from '@/constants/Colors';

interface BookNoteProps {
  note: BookNoteType;
  onDelete: (noteId: string) => void;
}



export function BookNote({ note, onDelete }: BookNoteProps) {
  const colors = useColors();

  return (
    <View style={[bookStyles.noteContainer, {backgroundColor: colors.card, padding: 10, borderRadius: 10}]}>
      <View style={bookStyles.noteHeader}>
        <Text style={[bookStyles.noteDate, {color: colors.text, fontWeight: 'bold'}]}>{note.date}</Text>
        <TouchableOpacity 
          style={bookStyles.deleteButton}
          onPress={() => onDelete(note.id)}
        >
          <FontAwesome name="trash" size={20} color="#FF3B30" style={[bookStyles.deleteButton, {backgroundColor: colors.background, padding: 5, borderRadius: 8}]}/>
        </TouchableOpacity>
      </View>
      {note.page && (
        <Text style={[bookStyles.notePage, {color: colors.textSecondary}]}>Page {note.page}</Text>
      )}
      <Text style={[bookStyles.noteContent, {color: colors.text}]}>{note.content}</Text>
    </View>
  );
} 