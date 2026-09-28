import re

with open('src/screens/HomeScreen.js', 'r', encoding='utf-8') as f:
    text = f.read()

styles = """  modalContainer: { flex: 1, backgroundColor: '#0F172A' },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 50, backgroundColor: '#0F172A' },
  mapTitle: { color: '#E2E8F0', fontSize: 16, fontWeight: 'bold' },
  map: { flex: 1 },
  confirmBtn: { backgroundColor: '#3B82F6', padding: 20, alignItems: 'center', paddingBottom: 40 },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});"""

text = text.replace("});", styles)

with open('src/screens/HomeScreen.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
