# Imagem Padrão do SO (Ubuntu 22.04 LTS para todas as máquinas)
data "google_compute_image" "ubuntu" {
  family  = "ubuntu-2204-lts"
  project = "ubuntu-os-cloud"
}

# 1. Camada Frontend (Instância Pública)
resource "google_compute_instance" "frontend" {
  name         = "forca-frontend"
  machine_type = "e2-micro"
  zone         = var.zone
  tags         = ["frontend"]

  boot_disk {
    initialize_params {
      image = data.google_compute_image.ubuntu.self_link
      size  = 10
    }
  }

  network_interface {
    network    = google_compute_network.vpc_forca.name
    subnetwork = google_compute_subnetwork.subnet_public.name
    
    # Adicionar o bloco access_config aloca um IP Público para que a internet consiga acessar
    access_config {
      // Ephemeral IP
    }
  }

  # Script de inicialização customizado
  metadata_startup_script = <<-EOF
                              #!/bin/bash
                              apt-get update && apt-get install -y nginx docker.io
                              systemctl enable docker
                            EOF
}

# 2. Camada Backend (Instância Privada)
resource "google_compute_instance" "backend" {
  name         = "forca-backend"
  machine_type = "e2-micro"
  zone         = var.zone
  tags         = ["backend"] # Mesma tag usada na regra de entrada pro BD

  boot_disk {
    initialize_params {
      image = data.google_compute_image.ubuntu.self_link
      size  = 10
    }
  }

  network_interface {
    network    = google_compute_network.vpc_forca.name
    subnetwork = google_compute_subnetwork.subnet_private.name
    
    # NÃO TEM access_config: Essa máquina NÃO TERÁ IP público (Isolamento total com a internet)
  }

  metadata_startup_script = <<-EOF
                              #!/bin/bash
                              apt-get update && apt-get install -y nodejs npm docker.io docker-compose
                              systemctl enable docker
                            EOF
}

# 3. Camada Banco de Dados (Instância Privada)
resource "google_compute_instance" "database" {
  name         = "forca-db"
  machine_type = "e2-micro" // Sugerido ser no mínimo e2-small para BD real
  zone         = var.zone
  tags         = ["database"]

  boot_disk {
    initialize_params {
      image = data.google_compute_image.ubuntu.self_link
      size  = 20       // Bancos requerem mais disco
    }
  }

  network_interface {
    network    = google_compute_network.vpc_forca.name
    subnetwork = google_compute_subnetwork.subnet_private.name
    
    # NÃO TEM access_config: O MySQL não pode sofrer conexões diretas da internet.
  }

  metadata_startup_script = <<-EOF
                              #!/bin/bash
                              apt-get update && apt-get install -y mysql-server docker.io docker-compose
                              systemctl enable docker
                            EOF
}
