document.addEventListener("DOMContentLoaded", () => {
  // Initialize time and date
  updateDateTime()
  setInterval(updateDateTime, 60000) // Update every minute

  // Define folder structure
  const items = [
    { id: "work", name: "Work", type: "folder", parent: null },
    { id: "about", name: "About", type: "folder", parent: "work" },
    { id: "projects", name: "Projects", type: "folder", parent: "work" },
    { id: "images", name: "Images", type: "folder", parent: "work" },
    { id: "spotify_playlists", name: "spotify_playlists", type: "folder", parent: null },

    // Files inside About folder
    { id: "about_me.pdf", name: "about_me.pdf", type: "file", parent: "about" },
    { id: "experience.pdf", name: "experience.pdf", type: "file", parent: "about" },
    { id: "tools.pdf", name: "tools.pdf", type: "file", parent: "about" },

    // Add some files to Projects folder
    { id: "project1.pdf", name: "project1.pdf", type: "file", parent: "projects" },
    { id: "project2.pdf", name: "project2.pdf", type: "file", parent: "projects" },

    // Add some files to Images folder
    { id: "image1.jpg", name: "image1.jpg", type: "file", parent: "images" },
    { id: "image2.jpg", name: "image2.jpg", type: "file", parent: "images" },

    // Add some files to spotify_playlists folder
    { id: "playlist1.mp3", name: "playlist1.mp3", type: "file", parent: "spotify_playlists" },
    { id: "playlist2.mp3", name: "playlist2.mp3", type: "file", parent: "spotify_playlists" },
  ]

  // State variables
  let viewMode = "grid"
  let activeFile = ""
  let currentFolder = null // null means root level
  let navigationPath = [] // Keep track of navigation path
  let activeColumn = 0 // 0 = profile, 1 = folders, 2 = content
  const expandedFolders = {
    work: true,
    about: true,
  }

  // Initialize view buttons
  const gridViewBtn = document.getElementById("grid-view")
  const listViewBtn = document.getElementById("list-view")
  const detailViewBtn = document.getElementById("detail-view")

  gridViewBtn.addEventListener("click", () => setViewMode("grid"))
  listViewBtn.addEventListener("click", () => setViewMode("list"))
  detailViewBtn.addEventListener("click", () => setViewMode("detail"))

  // Initial render
  renderFolderView()
  renderFileContent(activeFile)
  setupMobileNavigation()

  // Functions
  function updateDateTime() {
    const now = new Date()
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    document.getElementById("current-day").textContent = days[now.getDay()]

    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    document.getElementById("current-time").textContent = `${hours}:${minutes}`
  }

  function setViewMode(mode) {
    viewMode = mode

    // Update active button
    gridViewBtn.classList.remove("active")
    listViewBtn.classList.remove("active")
    detailViewBtn.classList.remove("active")

    if (mode === "grid") {
      gridViewBtn.classList.add("active")
    } else if (mode === "list") {
      listViewBtn.classList.add("active")
    } else if (mode === "detail") {
      detailViewBtn.classList.add("active")
    }

    renderFolderView()
  }

  function toggleFolder(folderId, event) {
    if (event) {
      event.stopPropagation()
    }

    expandedFolders[folderId] = !expandedFolders[folderId]
    renderFolderView()
  }

  function navigateToFolder(folderId) {
    if (folderId === null) {
      // Going to root
      currentFolder = null
      navigationPath = []
    } else {
      const folder = items.find((item) => item.id === folderId)
      if (folder) {
        currentFolder = folderId

        // Update navigation path
        if (folder.parent === null) {
          // This is a root folder
          navigationPath = [folderId]
        } else {
          // Find the path to this folder
          const path = [folderId]
          let parentId = folder.parent

          while (parentId !== null) {
            path.unshift(parentId)
            const parent = items.find((item) => item.id === parentId)
            parentId = parent ? parent.parent : null
          }

          navigationPath = path
        }
      }
    }

    renderFolderView()
  }

  function navigateUp() {
    if (navigationPath.length > 1) {
      // Go up one level
      navigationPath.pop()
      currentFolder = navigationPath[navigationPath.length - 1]
    } else {
      // Go to root
      navigationPath = []
      currentFolder = null
    }

    renderFolderView()
  }

  function handleFolderClick(folderId) {
    if (viewMode === "list") {
      // Di list view, toggle expansion
      toggleFolder(folderId)
    } else {
      // Di grid atau detail view, navigasi ke folder
      navigateToFolder(folderId)
    }
  }

  function getCurrentItems() {
    return items.filter((item) => item.parent === currentFolder)
  }

  function getRootItems() {
    return items.filter((item) => item.parent === null)
  }

  function getChildItems(parentId) {
    return items.filter((item) => item.parent === parentId)
  }

  function getFolderName(folderId) {
    const folder = items.find((item) => item.id === folderId)
    return folder ? folder.name : ""
  }

  // Perbaiki fungsi renderFolderView untuk menampilkan breadcrumb yang lebih baik
  function renderFolderView() {
    const folderView = document.getElementById("folder-view")
    folderView.innerHTML = ""

    // Add breadcrumb/navigation for all view modes when not at root
    if (currentFolder !== null) {
      const breadcrumb = document.createElement("div")
      breadcrumb.className = "breadcrumb"

      const backButton = document.createElement("button")
      backButton.className = "back-button"
      backButton.innerHTML = '<i class="fa-solid fa-chevron-left"></i>'
      backButton.addEventListener("click", navigateUp)
      breadcrumb.appendChild(backButton)

      // Add path
      const pathText = document.createElement("span")
      pathText.className = "path-text"

      const pathNames = navigationPath.map((id) => getFolderName(id))
      pathText.textContent = " / " + pathNames.join(" / ")

      breadcrumb.appendChild(pathText)
      folderView.appendChild(breadcrumb)
    }

    if (viewMode === "list") {
      renderListView(folderView)
    } else if (viewMode === "grid") {
      renderGridView(folderView)
    } else if (viewMode === "detail") {
      renderDetailView(folderView)
    }
  }

  // Ubah fungsi renderListView untuk menampilkan struktur folder hierarkis
  function renderListView(container) {
    const listContainer = document.createElement("div")
    listContainer.className = "folder-view list-view"

    // Buat fungsi rekursif untuk membangun struktur folder
    function buildFolderTree(parentId, level = 0) {
      const folderItems = items.filter((item) => item.parent === parentId)

      const listElement = document.createElement("div")
      listElement.className = "folder-list"

      if (level > 0) {
        listElement.style.paddingLeft = `${level * 20}px`
      }

      folderItems.forEach((item) => {
        const itemElement = document.createElement("div")
        itemElement.className = "folder-item"
        itemElement.setAttribute("data-id", item.id)

        if (item.type === "folder") {
          const toggleButton = document.createElement("button")
          toggleButton.className = "folder-toggle"

          // Gunakan chevron yang sesuai berdasarkan status expanded
          if (expandedFolders[item.id]) {
            toggleButton.innerHTML = '<i class="fa-solid fa-chevron-down"></i>'
          } else {
            toggleButton.innerHTML = '<i class="fa-solid fa-chevron-right"></i>'
          }

          toggleButton.addEventListener("click", (e) => toggleFolder(item.id, e))
          itemElement.appendChild(toggleButton)
        } else {
          // Tambahkan spacer untuk file agar sejajar dengan folder
          const spacer = document.createElement("span")
          spacer.className = "folder-toggle-spacer"
          itemElement.appendChild(spacer)
        }

        const iconElement = document.createElement("i")
        iconElement.className =
          item.type === "folder" ? "fa-solid fa-folder folder-icon" : "fa-solid fa-file-lines folder-icon"
        itemElement.appendChild(iconElement)

        const nameElement = document.createElement("span")
        nameElement.className = "folder-name"
        nameElement.textContent = item.name
        itemElement.appendChild(nameElement)

        if (item.type === "file") {
          itemElement.addEventListener("click", () => handleFileClick(item.id))
        } else {
          itemElement.addEventListener("click", (e) => {
            // Hanya handle jika tidak mengklik tombol toggle
            if (!e.target.closest(".folder-toggle")) {
              handleFileClick(item.id)
            }
          })
        }

        listElement.appendChild(itemElement)

        // Jika ini adalah folder dan expanded, tambahkan anak-anaknya secara rekursif
        if (item.type === "folder" && expandedFolders[item.id]) {
          const childItems = items.filter((child) => child.parent === item.id)
          if (childItems.length > 0) {
            const childrenContainer = buildFolderTree(item.id, level + 1)
            listElement.appendChild(childrenContainer)
          }
        }
      })

      return listElement
    }

    // Mulai membangun dari level root
    const treeElement = buildFolderTree(null)
    listContainer.appendChild(treeElement)

    container.appendChild(listContainer)
  }

  function createListItem(item) {
    const itemElement = document.createElement("div")
    itemElement.className = "folder-item"
    itemElement.setAttribute("data-id", item.id)

    if (item.type === "folder") {
      const toggleButton = document.createElement("button")
      toggleButton.className = "folder-toggle"

      // Use the correct chevron direction based on expanded state
      if (expandedFolders[item.id]) {
        toggleButton.innerHTML = '<i class="fa-solid fa-chevron-down"></i>'
      } else {
        toggleButton.innerHTML = '<i class="fa-solid fa-chevron-right"></i>'
      }

      toggleButton.addEventListener("click", (e) => toggleFolder(item.id, e))
      itemElement.appendChild(toggleButton)
    } else {
      // Add empty space for files to align with folders
      const spacer = document.createElement("span")
      spacer.className = "folder-toggle-spacer"
      itemElement.appendChild(spacer)
    }

    const iconElement = document.createElement("i")
    iconElement.className =
      item.type === "folder" ? "fa-solid fa-folder folder-icon" : "fa-solid fa-file-lines folder-icon"
    itemElement.appendChild(iconElement)

    const nameElement = document.createElement("span")
    nameElement.className = "folder-name"
    nameElement.textContent = item.name
    itemElement.appendChild(nameElement)

    if (item.type === "file") {
      itemElement.addEventListener("click", () => handleFileClick(item.id))
    } else {
      itemElement.addEventListener("click", (e) => {
        // Only handle if not clicking on the toggle button
        if (!e.target.closest(".folder-toggle")) {
          handleFileClick(item.id)
        }
      })
    }

    return itemElement
  }

  // Perbaiki fungsi renderGridView untuk menampilkan grid yang lebih baik
  function renderGridView(container) {
    const gridContainer = document.createElement("div")
    gridContainer.className = "folder-view grid-view"

    const folderItems = currentFolder === null ? getRootItems() : getCurrentItems()

    // Jika tidak ada item, tampilkan pesan kosong
    if (folderItems.length === 0) {
      const emptyMessage = document.createElement("div")
      emptyMessage.className = "empty-folder-message"
      emptyMessage.textContent = "This folder is empty"
      gridContainer.appendChild(emptyMessage)
    } else {
      folderItems.forEach((item) => {
        const itemElement = document.createElement("div")
        itemElement.className = "folder-item"
        itemElement.setAttribute("data-id", item.id)

        if (item.type === "folder") {
          itemElement.addEventListener("click", () => navigateToFolder(item.id))
        } else {
          itemElement.addEventListener("click", () => handleFileClick(item.id))
        }

        const iconWrapper = document.createElement("div")
        iconWrapper.className = "folder-icon-wrapper"

        const iconElement = document.createElement("i")
        iconElement.className =
          item.type === "folder" ? "fa-solid fa-folder folder-icon" : "fa-solid fa-file-lines folder-icon"
        iconWrapper.appendChild(iconElement)

        const nameElement = document.createElement("span")
        nameElement.className = "folder-name"
        nameElement.textContent = item.name

        // Tambahkan title untuk nama file panjang
        itemElement.setAttribute("title", item.name)

        itemElement.appendChild(iconWrapper)
        itemElement.appendChild(nameElement)
        gridContainer.appendChild(itemElement)
      })
    }

    container.appendChild(gridContainer)
  }

  // Tambahkan efek hover yang lebih terlihat pada renderDetailView
  function renderDetailView(container) {
    const detailContainer = document.createElement("div")
    detailContainer.className = "folder-view detail-view"

    // First column - Root folders
    const rootPanel = document.createElement("div")
    rootPanel.className = "detail-column root-folders"

    const rootItems = getRootItems()
    rootItems.forEach((item) => {
      const itemElement = document.createElement("div")
      itemElement.className = `folder-item ${currentFolder === item.id ? "active" : ""}`

      const iconElement = document.createElement("i")
      iconElement.className = "fa-solid fa-folder folder-icon"

      const nameElement = document.createElement("span")
      nameElement.className = "folder-name"
      nameElement.textContent = item.name

      itemElement.appendChild(iconElement)
      itemElement.appendChild(nameElement)

      if (item.type === "folder") {
        const navArrow = document.createElement("span")
        navArrow.className = "nav-arrow"
        navArrow.innerHTML = '<i class="fa-solid fa-chevron-right"></i>'
        itemElement.appendChild(navArrow)
      }

      itemElement.addEventListener("click", () => navigateToFolder(item.id))
      rootPanel.appendChild(itemElement)
    })

    // Second column - Subfolders of selected root folder
    const subfolderPanel = document.createElement("div")
    subfolderPanel.className = "detail-column subfolders"

    // Get the current root folder or the first part of the navigation path
    const currentRootFolder = navigationPath.length > 0 ? navigationPath[0] : null

    if (currentRootFolder) {
      const subfolders = getChildItems(currentRootFolder)
      subfolders.forEach((item) => {
        const itemElement = document.createElement("div")
        itemElement.className = `folder-item ${currentFolder === item.id ? "active" : ""}`

        const iconElement = document.createElement("i")
        iconElement.className =
          item.type === "folder" ? "fa-solid fa-folder folder-icon" : "fa-solid fa-file-lines folder-icon"

        const nameElement = document.createElement("span")
        nameElement.className = "folder-name"
        nameElement.textContent = item.name

        itemElement.appendChild(iconElement)
        itemElement.appendChild(nameElement)

        if (item.type === "folder") {
          const navArrow = document.createElement("span")
          navArrow.className = "nav-arrow"
          navArrow.innerHTML = '<i class="fa-solid fa-chevron-right"></i>'
          itemElement.appendChild(navArrow)
        }

        itemElement.addEventListener("click", () => {
          if (item.type === "folder") {
            navigateToFolder(item.id)
          } else {
            handleFileClick(item.id)
          }
        })
        subfolderPanel.appendChild(itemElement)
      })
    }

    // Third column - Files in the current folder
    const filesPanel = document.createElement("div")
    filesPanel.className = "detail-column files"

    // Get files from the current folder (if it's a subfolder)
    const currentSubfolder = navigationPath.length > 1 ? navigationPath[navigationPath.length - 1] : null

    if (currentSubfolder) {
      const files = getChildItems(currentSubfolder)
      files.forEach((item) => {
        const itemElement = document.createElement("div")
        itemElement.className = "folder-item"

        const iconElement = document.createElement("i")
        iconElement.className =
          item.type === "folder" ? "fa-solid fa-folder folder-icon" : "fa-solid fa-file-lines folder-icon"

        const nameElement = document.createElement("span")
        nameElement.className = "folder-name"
        nameElement.textContent = item.name

        itemElement.appendChild(iconElement)
        itemElement.appendChild(nameElement)

        itemElement.addEventListener("click", () => {
          if (item.type === "folder") {
            navigateToFolder(item.id)
          } else {
            handleFileClick(item.id)
          }
        })
        filesPanel.appendChild(itemElement)
      })
    }

    detailContainer.appendChild(rootPanel)
    detailContainer.appendChild(subfolderPanel)
    detailContainer.appendChild(filesPanel)
    container.appendChild(detailContainer)
  }

  function renderFileContent(fileId) {
    const fileContent = document.getElementById("file-content")
    fileContent.innerHTML = ""

    switch (fileId) {
      case "about_me.pdf":
        renderAboutMeContent(fileContent)
        break
      case "experience.pdf":
        renderExperienceContent(fileContent)
        break
      case "tools.pdf":
        renderToolsContent(fileContent)
        break
      default:
        // Generic file content for other files
        fileContent.innerHTML = `
          <div class="file-header">
            <h2>${fileId}</h2>
          </div>
          <div class="file-body">
            <p>This is the content of ${fileId}.</p>
          </div>
        `
    }
  }

  function renderAboutMeContent(container) {
    container.innerHTML = `
      <div class="file-header">
        <img src="assets/8337207eeff664a7a6486bf2e659d23a - Copy.jpg" alt="Profile">
      </div>
      
      <div class="file-body">
        <p>
          Hey, I'm Calvin Xavian, a UI/UX designer and Webflow Developer with over 4 years of diverse experience. I
          specialize in crafting visuals that effectively communicate messages and bring brand stories to life.
        </p>
        
        <p>
          My expertise includes designing product showcases, promotional & corporate websites, combining
          creative development with a wide range of tools. I'm dedicated to delivering innovative, impactful
          solutions tailored to meet each client's unique needs.
        </p>
        
        <div class="skills-section">
          <h3>Expertise & Skills:</h3>
          <ul class="skills-list">
            <li>User Experience</li>
            <li>User Interface</li>
            <li>Graphic Design</li>
            <li>Webflow Development</li>
            <li>Market Research, Competitive Analysis</li>
            <li>HTML, CSS, JS, GSAP, Barba.js, Node.js (basic level)</li>
          </ul>
        </div>
      </div>
      
      <img src="assets/tutel.png" alt="Decorative apple" class="decorative-image">
    `
  }

  function renderExperienceContent(container) {
    container.innerHTML = `
      <h2 class="text-2xl font-bold mb-6">Professional Experience</h2><br>
      
      <div class="experience-section">
        <div class="experience-item">
          <h3>Senior UI/UX Designer</h3>
          <div class="company">DigitalCraft Studio • 2021 - Present</div>
          <p>
            Led design for enterprise clients, resulting in 40% increase in user engagement and 25% improvement
            in conversion rates.
          </p>
        </div>
        
        <div class="experience-item">
          <h3>Webflow Developer</h3>
          <div class="company">Freelance • 2019 - Present</div>
          <p>
            Developed over 30 custom websites for clients across various industries, specializing in interactive
            animations and responsive designs.
          </p>
        </div>
        
        <div class="experience-item">
          <h3>UI Designer</h3>
          <div class="company">TechVision Inc. • 2018 - 2021</div>
          <p>
            Created user interfaces for mobile applications and web platforms, collaborating with development
            teams to ensure seamless implementation.
          </p>
        </div>
      </div>
      
      <div class="education-section">
        <h2 class="text-2xl font-bold mb-6">Education</h2>
        
        <div class="education-item">
          <h3>Bachelor of Design</h3>
          <div class="school">Kyiv National University of Arts • 2014 - 2018</div>
        </div>
        
        <div class="education-item">
          <h3>UX Certification</h3>
          <div class="school">Nielsen Norman Group • 2019</div>
        </div>
      </div>
    `
  }

  function renderToolsContent(container) {
    container.innerHTML = `
      <h2 class="text-2xl font-bold mb-6">Tools & Technologies</h2><br>
      
      <div class="tools-grid">
        <div class="tools-category">
          <h3>Design</h3>
          <ul class="tools-list">
            <li>Figma</li>
            <li>Adobe XD</li>
            <li>Photoshop</li>
            <li>Illustrator</li>
            <li>After Effects</li>
          </ul>
        </div>
        
        <div class="tools-category">
          <h3>Development</h3>
          <ul class="tools-list">
            <li>HTML/CSS</li>
            <li>JavaScript</li>
            <li>Webflow</li>
            <li>GSAP</li>
            <li>Barba.js</li>
          </ul>
        </div>
        
        <div class="tools-category">
          <h3>Project Management</h3>
          <ul class="tools-list">
            <li>Notion</li>
            <li>Trello</li>
            <li>Asana</li>
            <li>Slack</li>
          </ul>
        </div>
        
        <div class="tools-category">
          <h3>Research</h3>
          <ul class="tools-list">
            <li>Hotjar</li>
            <li>Google Analytics</li>
            <li>Maze</li>
            <li>UserTesting</li>
          </ul>
        </div>
      </div>
      
      <div class="learning-section">
        <h3>Continuous Learning</h3>
        <p>
          I'm constantly expanding my skillset through online courses, workshops, and industry conferences.
          Currently learning React and exploring 3D design with Blender.
        </p>
      </div>
    `
  }

  // Mobile navigation setup
  function setupMobileNavigation() {
    // Hapus navigasi mobile yang ada jika ada
    const existingNav = document.querySelector(".mobile-nav")
    if (existingNav) {
      existingNav.remove()
    }

    // Buat navigasi mobile baru
    const mobileNav = document.createElement("div")
    mobileNav.className = "mobile-nav"
    mobileNav.innerHTML = `
    <div class="mobile-nav-buttons">
      <a href="#" class="mobile-nav-button active" data-column="0">
        <i class="fa-solid fa-user"></i>
        <span>Profile</span>
      </a>
      <a href="#" class="mobile-nav-button" data-column="1">
        <i class="fa-solid fa-folder"></i>
        <span>Files</span>
      </a>
      <a href="#" class="mobile-nav-button" data-column="2">
        <i class="fa-solid fa-file-lines"></i>
        <span>Content</span>
      </a>
    </div>
  `
    document.body.appendChild(mobileNav)

    // Tambahkan event listeners ke tombol navigasi mobile
    const navButtons = mobileNav.querySelectorAll(".mobile-nav-button")
    navButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault()
        const columnIndex = Number.parseInt(button.getAttribute("data-column"))
        switchToColumn(columnIndex)
      })
    })

    // Pengaturan kolom awal untuk mobile
    if (window.innerWidth <= 768) {
      switchToColumn(0)
      mobileNav.style.display = "block"
    } else {
      mobileNav.style.display = "none"
    }

    // Tangani event resize
    window.addEventListener("resize", handleResize)

    // Panggil handleResize sekali untuk mengatur tampilan awal dengan benar
    handleResize()
  }

  // Perbaiki fungsi switchToColumn untuk memastikan transisi yang mulus
  function switchToColumn(columnIndex) {
    if (window.innerWidth <= 768) {
      const columns = document.querySelectorAll(".column")
      columns.forEach((column, index) => {
        if (index === columnIndex) {
          column.classList.add("active")
          column.style.display = "block" // Pastikan kolom aktif terlihat
        } else {
          column.classList.remove("active")
          column.style.display = "none" // Sembunyikan kolom lain
        }
      })
      activeColumn = columnIndex

      // Update tombol navigasi mobile
      const navButtons = document.querySelectorAll(".mobile-nav-button")
      navButtons.forEach((btn, index) => {
        if (index === columnIndex) {
          btn.classList.add("active")
        } else {
          btn.classList.remove("active")
        }
      })
    }
  }

  // Perbaiki handleResize untuk menangani perubahan ukuran dengan lebih baik
  function handleResize() {
    const isMobile = window.innerWidth <= 768
    const columns = document.querySelectorAll(".column")

    if (!isMobile) {
      // Reset untuk tampilan desktop
      columns.forEach((column) => {
        column.classList.remove("active")
        column.style.display = "block"
      })

      // Sembunyikan navigasi mobile
      const mobileNav = document.querySelector(".mobile-nav")
      if (mobileNav) mobileNav.style.display = "none"
    } else {
      // Tampilan mobile
      columns.forEach((column, index) => {
        if (index === activeColumn) {
          column.classList.add("active")
          column.style.display = "block"
        } else {
          column.classList.remove("active")
          column.style.display = "none"
        }
      })

      // Tampilkan navigasi mobile
      const mobileNav = document.querySelector(".mobile-nav")
      if (mobileNav) mobileNav.style.display = "block"
    }
  }

  // Tambahkan fungsi untuk kembali ke tampilan folder saat melihat file di mobile
  function handleFileClickMobile(fileId) {
    activeFile = fileId
    renderFileContent(fileId)

    // Pada mobile, beralih ke tampilan konten
    if (window.innerWidth <= 768) {
      switchToColumn(2)

      // Tambahkan tombol kembali ke tampilan file
      const fileContent = document.getElementById("file-content")
      const backButton = document.createElement("button")
      backButton.className = "mobile-back-button"
      backButton.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Back to Files'
      backButton.addEventListener("click", () => switchToColumn(1))

      // Sisipkan tombol di awal konten
      if (fileContent.firstChild) {
        fileContent.insertBefore(backButton, fileContent.firstChild)
      } else {
        fileContent.appendChild(backButton)
      }
    }
  }

  // Perbaiki fungsi handleFileClick untuk memastikan file yang benar dibuka
  function handleFileClick(fileId) {
    // Pastikan fileId valid
    const fileItem = items.find((item) => item.id === fileId)
    if (!fileItem) return

    // Normalisasi nama file untuk menghindari masalah konsistensi
    const normalizedFileId = fileId.toLowerCase().replace(/\s+/g, "_")

    if (window.innerWidth <= 768) {
      handleFileClickMobile(normalizedFileId)
    } else {
      activeFile = normalizedFileId
      renderFileContent(normalizedFileId)
    }
  }
})
