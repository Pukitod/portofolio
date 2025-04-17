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
    const viewMode = "grid"
    const activeFile = ""
    const currentFolder = null // null means root level
    const navigationPath = [] // Keep track of navigation path
    const activeColumn = 0 // 0 = profile, 1 = folders, 2 = content
    const expandedFolders = {
      work: true,
      about: true,
    }
  
    // Initial render
    renderFolderStructure()
    setupPopup()
  
    // Functions
    function updateDateTime() {
      const now = new Date()
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  
      document.getElementById("current-day").textContent = days[now.getDay()]
  
      const hours = now.getHours()
      const minutes = now.getMinutes().toString().padStart(2, "0")
      const ampm = hours >= 12 ? "PM" : "AM"
      const displayHours = hours % 12 || 12 // Convert 0 to 12 for 12 AM
  
      document.getElementById("current-time").textContent = `${displayHours}:${minutes} ${ampm}`
    }
  
    function renderFolderStructure() {
      const folderStructure = document.getElementById("folder-structure")
      folderStructure.innerHTML = ""
  
      // Get root items
      const rootItems = items.filter((item) => item.parent === null)
  
      // Render each root item
      rootItems.forEach((item) => {
        renderItem(item, folderStructure)
      })
    }
  
    function renderItem(item, container) {
      if (item.type === "folder") {
        // Create folder item
        const folderItem = document.createElement("div")
        folderItem.className = `folder-item ${expandedFolders[item.id] ? "expanded" : ""}`
        folderItem.innerHTML = `
          <i class="fa-solid fa-folder"></i>
          <span class="folder-name">${item.name}</span>
          <i class="fa-solid fa-chevron-right folder-toggle"></i>
        `
  
        // Add click event to toggle folder
        folderItem.addEventListener("click", (e) => {
          e.stopPropagation()
          toggleFolder(item.id)
        })
  
        container.appendChild(folderItem)
  
        // Create container for children
        const childrenContainer = document.createElement("div")
        childrenContainer.className = "folder-children"
        container.appendChild(childrenContainer)
  
        // Render children if folder is expanded
        if (expandedFolders[item.id]) {
          const children = items.filter((child) => child.parent === item.id)
          children.forEach((child) => {
            renderItem(child, childrenContainer)
          })
        }
      } else {
        // Create file item
        const fileItem = document.createElement("div")
        fileItem.className = "file-item"
        fileItem.innerHTML = `
          <i class="fa-solid fa-file-lines"></i>
          <span class="file-name">${item.name}</span>
        `
  
        // Add click event to open file
        fileItem.addEventListener("click", (e) => {
          e.stopPropagation()
          openFile(item.id)
        })
  
        container.appendChild(fileItem)
      }
    }
  
    function toggleFolder(folderId) {
      expandedFolders[folderId] = !expandedFolders[folderId]
      renderFolderStructure()
    }
  
    function openFile(fileId) {
      const popup = document.getElementById("popup-overlay")
      const popupTitle = document.getElementById("popup-title")
      const popupBody = document.getElementById("popup-body")
  
      // Find the file
      const file = items.find((item) => item.id === fileId)
      if (!file) return
  
      // Set popup title
      popupTitle.textContent = file.name
  
      // Set popup content based on file
      switch (fileId) {
        case "about_me.pdf":
          renderAboutMeContent(popupBody)
          break
        case "experience.pdf":
          renderExperienceContent(popupBody)
          break
        case "tools.pdf":
          renderToolsContent(popupBody)
          break
        default:
          popupBody.innerHTML = `<p>Content for ${file.name}</p>`
      }
  
      // Show popup
      popup.classList.add("active")
    }
  
    function setupPopup() {
      const popup = document.getElementById("popup-overlay")
      const closeButton = document.getElementById("close-popup")
  
      // Close popup when clicking close button
      closeButton.addEventListener("click", () => {
        popup.classList.remove("active")
      })
  
      // Close popup when clicking outside content
      popup.addEventListener("click", (e) => {
        if (e.target === popup) {
          popup.classList.remove("active")
        }
      })
  
      // Close popup when pressing Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && popup.classList.contains("active")) {
          popup.classList.remove("active")
        }
      })
    }
  
    function renderAboutMeContent(container) {
      container.innerHTML = `
        <div class="file-content">
          <img src="https://via.placeholder.com/600x300" alt="Profile">
          
          <p>
            Hey, I'm Joe Lee, a UI/UX designer and Webflow Developer with over 4 years of diverse experience. I
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
      `
    }
  
    function renderExperienceContent(container) {
      container.innerHTML = `
        <div class="file-content">
          <h2>Professional Experience</h2><br>
          
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
          
          <h2>Education</h2>
          
          <div class="education-section">
            <div class="experience-item">
              <h3>Bachelor of Design</h3>
              <div class="company">Kyiv National University of Arts • 2014 - 2018</div>
            </div>
            
            <div class="experience-item">
              <h3>UX Certification</h3>
              <div class="company">Nielsen Norman Group • 2019</div>
            </div>
          </div>
        </div>
      `
    }
  
    function renderToolsContent(container) {
      container.innerHTML = `
        <div class="file-content">
          <h2>Tools & Technologies</h2><br>
          
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
        </div>
      `
    }
  })
  