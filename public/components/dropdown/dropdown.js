const customDropdown = document.querySelectorAll(".custom-dropdown")
customDropdown.forEach(dropdown => {
    dropdown.addEventListener("click" , () => {
        dropdown.classList.toggle("active")
    })
})