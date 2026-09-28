import re

with open('src/screens/HomeScreen.js', 'r', encoding='utf-8') as f:
    text = f.read()

styles_old = """  mapTitle: { color: '#E2E8F0', fontSize: 16, fontWeight: 'bold' },
  map: { flex: 1 },
  confirmBtn: { backgroundColor: '#3B82F6', padding: 20, alignItems: 'center', paddingBottom: 40 },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});"""

styles_new = """  mapTitle: { color: '#E2E8F0', fontSize: 16, fontWeight: 'bold' },
  locationList: { flex: 1, padding: 20 },
  locationListItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  locationIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(34, 211, 238, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  locName: { color: '#F1F5F9', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  locDesc: { color: '#94A3B8', fontSize: 12 },
});"""

text = text.replace(styles_old, styles_new)

with open('src/screens/HomeScreen.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
