# 1. Regra para o Frontend: Permitir HTTP/HTTPS de qualquer lugar (0.0.0.0/0)
resource "google_compute_firewall" "allow_frontend_web" {
  name    = "allow-frontend-web"
  network = google_compute_network.vpc_forca.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "8080", "3001"] # Inclui a porta 3001 que estava na tabela original
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["frontend"]
}

# 2. Regra para o Backend: Permitir tráfego na porta 3000 SOMENTE vindo da Sub-rede Pública
resource "google_compute_firewall" "allow_backend_internal" {
  name    = "allow-backend-internal"
  network = google_compute_network.vpc_forca.name

  allow {
    protocol = "tcp"
    ports    = ["3000"]
  }

  source_ranges = [google_compute_subnetwork.subnet_public.ip_cidr_range]
  target_tags   = ["backend"]
}

# 3. Regra para o Banco de Dados: Permitir MySQL (3306/3307) SOMENTE vindo do Backend ou da VPN (Vamos simplificar usando a tag do backend)
resource "google_compute_firewall" "allow_db_internal" {
  name    = "allow-db-internal"
  network = google_compute_network.vpc_forca.name

  allow {
    protocol = "tcp"
    ports    = ["3306", "3307"]
  }

  # Permite que qualquer máquina com a tag "backend" converse com o DB
  source_tags = ["backend"]
  target_tags = ["database"]
}

# 4. Permitir SSH (Porta 22) para acesso do Administrador e do GitHub Actions via IAP ou IPs específicos
resource "google_compute_firewall" "allow_ssh" {
  name    = "allow-ssh"
  network = google_compute_network.vpc_forca.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  # Como boa prática na nuvem real, isso deveria ser restrito. Iremos deixar o CIDR do IAP aberto para fins didáticos:
  source_ranges = ["35.235.240.0/20"] # IPs do Identity-Aware Proxy da Google
}
