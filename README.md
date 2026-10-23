# 📝 Todo List App — Tugas Praktikum Komputasi Awan

Aplikasi **Todo List** sederhana dibangun dengan **Node.js (Express) + MySQL**, dikontainerisasi menggunakan **Docker** dan dikelola dengan **Docker Compose**.

## 🗂️ Struktur Folder

```
Tugas Praktikum/
├── app/
│   ├── public/
│   │   └── style.css          # CSS frontend
│   ├── views/
│   │   └── index.ejs          # Template HTML (EJS)
│   ├── server.js              # Entry point aplikasi
│   ├── package.json           # Dependensi Node.js
│   ├── Dockerfile             # Multi-stage Dockerfile
│   └── .dockerignore
├── compose.yaml               # Docker Compose (app + db)
├── .env                       # Variabel rahasia (jangan push!)
├── .env.example               # Contoh .env
├── .gitignore
└── README.md
```

## 🚀 Cara Menjalankan

### 1. Clone & Persiapan

```bash
git clone <repo-url>
cd "Tugas Praktikum"

# Salin .env.example dan isi nilainya
cp .env.example .env
nano .env   # atau edit dengan text editor
```

### 2. Jalankan dengan Docker Compose

```bash
# Build dan jalankan semua service
docker compose up -d

# Cek status service
docker compose ps

# Lihat log
docker compose logs -f
```

### 3. Akses Aplikasi

- **Lokal:** http://localhost:3000  
- **Azure VM:** http://<IP_PUBLIC_VM>:3000

## 🔧 Fitur

- ✅ Tambah todo dengan judul dan deskripsi
- ✅ Tandai todo sebagai selesai/belum
- ✅ Hapus todo
- ✅ Statistik todo (total, aktif, selesai)
- ✅ Responsive design

## 🐳 Ketentuan Docker yang Dipenuhi

| Ketentuan | Implementasi |
|-----------|-------------|
| Multi-stage Dockerfile | `builder` → `production` stage |
| Minimal 2 service | `app` (Node.js) + `db` (MySQL) |
| Internal network | `internal_network` bridge, port db tidak expose |
| Volume | `db_data` untuk persistensi MySQL |
| Healthcheck | MySQL healthcheck + app healthcheck |
| `depends_on` service_healthy | App tunggu DB sehat sebelum start |
| `restart: unless-stopped` | Ada di kedua service |
| `.env` + `.env.example` | Password disimpan di `.env` (di-.gitignore) |

## 🛑 Perintah Berguna

```bash
# Matikan semua container
docker compose down

# Matikan dan hapus volume (HATI-HATI: data hilang!)
docker compose down -v

# Lihat container berjalan
docker compose ps

# Masuk ke container app
docker exec -it todo_app sh

# Masuk ke container MySQL
docker exec -it todo_db mysql -u todouser -p tododb
```

## ⚠️ Penting

File `.env` berisi password dan **tidak boleh** di-push ke GitHub.  
Pastikan `.env` ada di `.gitignore`.
