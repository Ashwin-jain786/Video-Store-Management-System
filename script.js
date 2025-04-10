class Customer {
  constructor(name, email, phone) {
    this.id = Date.now().toString();
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.rentalHistory = [];
  }
}

class Video {
    constructor(name, category = 'General', year = '', director = '') {
        this.videoName = name;
        this.category = category;
        this.year = year;
        this.director = director;
        this.checkout = false;
        this.rating = 0;
        this.dueDate = null;
        this.checkedOutTo = null;
    }

    getName() {
        return this.videoName;
    }

    doCheckout() {
        this.checkout = true;
    }

    doReturn() {
        this.checkout = false;
    }

    receiveRating(rating) {
        this.rating = rating;
    }

    getRating() {
        return this.rating;
    }

    getCheckout() {
        return this.checkout;
    }
}

class VideoStore {
    constructor() {
        this.store = [];
        this.customers = [];
        this.loadVideos();
        this.loadCustomers();
    }

    addVideo(name, category, year, director) {
        const video = new Video(name, category, year, director);
        this.store.push(video);
        this.saveVideos();
        return video;
    }

    doCheckout(name, customerId) {
        const video = this.findVideo(name);
        const customer = this.findCustomer(customerId);
        if (video && customer) {
            video.doCheckout();
            video.checkedOutTo = customerId;
            video.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Due in 7 days
            
            // Add to customer's rental history
            customer.rentalHistory.push({
                videoName: name,
                checkoutDate: new Date(),
                dueDate: video.dueDate
            });
            
            this.saveVideos();
            this.saveCustomers();
            return true;
        }
        return false;
    }

    doReturn(name) {
        const video = this.findVideo(name);
        if (video && video.checkedOutTo) {
            const customer = this.findCustomer(video.checkedOutTo);
            if (customer) {
                // Update rental history with return date
                const rental = customer.rentalHistory.find(r => 
                    r.videoName === name && !r.returnDate
                );
                if (rental) {
                    rental.returnDate = new Date();
                }
                
                video.doReturn();
                video.checkedOutTo = null;
                video.dueDate = null;
                
                this.saveVideos();
                this.saveCustomers();
                return true;
            }
        }
        return false;
    }

    receiveRating(name, rating) {
        const video = this.findVideo(name);
        if (video) {
            video.receiveRating(rating);
            this.saveVideos();
            return true;
        }
        return false;
    }

    listInventory() {
        return [...this.store];
    }

    findVideo(name) {
        return this.store.find(v => v.getName().toLowerCase() === name.toLowerCase());
    }

    saveVideos() {
        try {
            localStorage.setItem('videoStore', JSON.stringify(this.store));
            return true;
        } catch (error) {
            console.error('Failed to save videos:', error);
            return false;
        }
    }

    loadVideos() {
        try {
            const saved = localStorage.getItem('videoStore');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.store = parsed.map(v => {
                    const video = new Video(v.videoName, v.category, v.year, v.director);
                    video.checkout = v.checkout;
                    video.rating = v.rating;
                    video.dueDate = v.dueDate;
                    video.checkedOutTo = v.checkedOutTo;
                    return video;
                });
            }
            return true;
        } catch (error) {
            console.error('Failed to load videos:', error);
            this.store = []; // Reset to empty array if corrupted
            return false;
        }
    }

    saveCustomers() {
        try {
            localStorage.setItem('videoCustomers', JSON.stringify(this.customers));
            return true;
        } catch (error) {
            console.error('Failed to save customers:', error);
            return false;
        }
    }

    loadCustomers() {
        try {
            const saved = localStorage.getItem('videoCustomers');
            if (saved) {
                this.customers = JSON.parse(saved);
            }
            return true;
        } catch (error) {
            console.error('Failed to load customers:', error);
            this.customers = []; // Reset to empty array if corrupted
            return false;
        }
    }

    addCustomer(name, email, phone) {
        const customer = new Customer(name, email, phone);
        this.customers.push(customer);
        this.saveCustomers();
        return customer;
    }

    findCustomer(id) {
        return this.customers.find(c => c.id === id);
    }

    updateCustomer(id, name, email, phone) {
        const customer = this.findCustomer(id);
        if (customer) {
            customer.name = name;
            customer.email = email;
            customer.phone = phone;
            this.saveCustomers();
            return true;
        }
        return false;
    }

    deleteCustomer(id) {
        const index = this.customers.findIndex(c => c.id === id);
        if (index !== -1) {
            this.customers.splice(index, 1);
            this.saveCustomers();
            return true;
        }
        return false;
    }

    getCustomerRentals(id) {
        const customer = this.findCustomer(id);
        return customer ? customer.rentalHistory : [];
    }
}

// DOM Manipulation and Event Handling
document.addEventListener('DOMContentLoaded', () => {
    const videoStore = new VideoStore();

    // Clear all data handler
    document.getElementById('clear-data-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
            localStorage.removeItem('videoStore');
            localStorage.removeItem('videoCustomers');
            videoStore.store = [];
            videoStore.customers = [];
            
            // Refresh all UI elements
            updateInventoryTable();
            updateCustomersTable();
            updateCustomerSelect();
            
            alert('All data has been cleared!');
        }
    });
    
    // Customer form handlers
    document.getElementById('add-customer-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('customer-name').value.trim();
        const email = document.getElementById('customer-email').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        
        if (name && email && phone) {
            videoStore.addCustomer(name, email, phone);
            document.getElementById('customer-name').value = '';
            document.getElementById('customer-email').value = '';
            document.getElementById('customer-phone').value = '';
            updateCustomersTable();
            updateCustomerSelect();
            alert(`Customer "${name}" added successfully!`);
        }
    });

    document.getElementById('update-customer-btn').addEventListener('click', () => {
        const select = document.getElementById('customer-select');
        const customerId = select.value;
        const name = document.getElementById('edit-customer-name').value.trim();
        const email = document.getElementById('edit-customer-email').value.trim();
        const phone = document.getElementById('edit-customer-phone').value.trim();
        
        if (customerId && (name || email || phone)) {
            const success = videoStore.updateCustomer(
                customerId,
                name || select.selectedOptions[0].text,
                email || select.selectedOptions[0].dataset.email,
                phone || select.selectedOptions[0].dataset.phone
            );
            
            if (success) {
                updateCustomersTable();
                updateCustomerSelect();
                alert('Customer updated successfully!');
            }
        }
    });

    document.getElementById('delete-customer-btn').addEventListener('click', () => {
        const customerId = document.getElementById('customer-select').value;
        if (customerId && confirm('Are you sure you want to delete this customer?')) {
            const success = videoStore.deleteCustomer(customerId);
            if (success) {
                updateCustomersTable();
                updateCustomerSelect();
                alert('Customer deleted successfully!');
            }
        }
    });

    document.getElementById('customer-select').addEventListener('change', (e) => {
        const customerId = e.target.value;
        if (customerId) {
            const customer = videoStore.findCustomer(customerId);
            if (customer) {
                document.getElementById('edit-customer-name').value = customer.name;
                document.getElementById('edit-customer-email').value = customer.email;
                document.getElementById('edit-customer-phone').value = customer.phone;
                updateRentalHistory(customer);
            }
        }
    });

    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    function updateRentalHistory(customer) {
        const tbody = document.querySelector('#rental-history tbody');
        tbody.innerHTML = '';
        
        customer.rentalHistory.sort((a,b) => 
            new Date(b.checkoutDate) - new Date(a.checkoutDate)
        ).forEach(rental => {
            const tr = document.createElement('tr');
            const isOverdue = !rental.returnDate && new Date(rental.dueDate) < new Date();
            
            tr.innerHTML = `
                <td>${rental.videoName}</td>
                <td>${formatDate(rental.checkoutDate)}</td>
                <td>${formatDate(rental.dueDate)}</td>
                <td>${formatDate(rental.returnDate)}</td>
                <td class="${isOverdue ? 'status-overdue' : ''}">
                    ${isOverdue ? 'Overdue' : rental.returnDate ? 'Returned' : 'Checked Out'}
                </td>
            `;
            if (rental.returnDate === null) {
                tr.addEventListener('click', () => {
                    document.getElementById('return-name').value = rental.videoName;
                    document.getElementById('return-name').focus();
                });
                tr.classList.add('clickable-row');
            }
            tbody.appendChild(tr);
        });
    }

    function updateCustomerSelect() {
        // Update all customer dropdowns
        const dropdowns = [
            document.getElementById('customer-select'),
            document.getElementById('checkout-customer'), 
            document.getElementById('return-customer')
        ];
        
        dropdowns.forEach(select => {
            if (select) {
                select.innerHTML = '<option value="">Select Customer</option>';
                
                videoStore.customers.forEach(customer => {
                    const option = document.createElement('option');
                    option.value = customer.id;
                    option.textContent = customer.name;
                    option.dataset.email = customer.email;
                    option.dataset.phone = customer.phone;
                    select.appendChild(option);
                });
            }
        });
    }

    function updateCustomersTable() {
        const tbody = document.querySelector('#customers-table tbody');
        tbody.innerHTML = '';
        
        videoStore.customers.forEach(customer => {
            const tr = document.createElement('tr');
            const activeRentals = customer.rentalHistory.filter(r => !r.returnDate).length;
            tr.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${activeRentals} / ${customer.rentalHistory.length}</td>
            `;
            if (customer.rentalHistory.some(r => !r.returnDate)) {
                tr.addEventListener('click', () => {
                    const activeRental = customer.rentalHistory.find(r => !r.returnDate);
                    if (activeRental) {
                        document.getElementById('return-name').value = activeRental.videoName;
                        document.getElementById('return-name').focus();
                    }
                });
                tr.classList.add('clickable-row');
            }
            tbody.appendChild(tr);
        });
    }
    const menuBtns = document.querySelectorAll('.menu-btn');
    const sections = document.querySelectorAll('.section');

    // Menu navigation
    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            menuBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(btn.dataset.section).classList.add('active');
            
            if (btn.dataset.section === 'inventory') {
                updateInventoryTable();
            } else if (btn.dataset.section === 'customers') {
                updateCustomersTable();
                updateCustomerSelect();
            } else if (btn.dataset.section === 'checkout') {
                updateCustomerSelect();
                document.getElementById('checkout-customer').value = '';
            } else if (btn.dataset.section === 'return') {
                updateCustomerSelect();
                document.getElementById('return-customer').value = '';
            }
        });
    });

    // Form submissions
    document.getElementById('add-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('video-name').value.trim();
        const category = document.getElementById('video-category').value.trim();
        const year = document.getElementById('video-year').value.trim();
        const director = document.getElementById('video-director').value.trim();
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        
        // Validate inputs
        let isValid = true;
        
        if (!name) {
            showError('video-name', 'Video name is required');
            isValid = false;
        } else if (videoStore.findVideo(name)) {
            showError('video-name', 'Video already exists');
            isValid = false;
        }
        
        if (year && !/^\d{4}$/.test(year)) {
            showError('video-year', 'Year must be 4 digits');
            isValid = false;
        }
        
        if (isValid) {
            const success = videoStore.addVideo(name, category, year, director);
            if (success) {
                document.getElementById('video-name').value = '';
                document.getElementById('video-category').value = '';
                document.getElementById('video-year').value = '';
                document.getElementById('video-director').value = '';
                showToast(`Video "${name}" added successfully!`, 'success');
                updateInventoryTable();
            } else {
                showToast('Failed to add video', 'error');
            }
        }
    });

    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        error.style.color = 'red';
        error.style.fontSize = '0.8em';
        error.style.marginTop = '5px';
        field.parentNode.insertBefore(error, field.nextSibling);
    }

    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    document.getElementById('checkout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('checkout-name').value.trim();
        const customerId = document.getElementById('checkout-customer').value;
        
        if (!name) {
            alert('Please enter a video name');
            return;
        }
        if (!customerId) {
            alert('Please select a customer');
            return;
        }
        
        const video = videoStore.findVideo(name);
        if (!video) {
            alert('Video not found!');
            return;
        }
        if (video.getCheckout()) {
            const customer = videoStore.findCustomer(video.checkedOutTo);
            alert(`Video is already checked out to ${customer?.name || 'another customer'}`);
            return;
        }

        const success = videoStore.doCheckout(name, customerId);
        if (success) {
            document.getElementById('checkout-name').value = '';
            document.getElementById('checkout-customer').value = '';
            updateInventoryTable();
            updateCustomersTable();
            alert(`Video "${name}" checked out successfully!`);
        }
    });

    document.getElementById('return-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('return-name').value.trim();
        const customerId = document.getElementById('return-customer').value;
        
        if (!name) {
            alert('Please enter a video name');
            return;
        }
        if (!customerId) {
            alert('Please select the customer returning the video');
            return;
        }
        
        const video = videoStore.findVideo(name);
        if (!video) {
            alert('Video not found!');
            return;
        }
        if (!video.getCheckout()) {
            alert('Video is not checked out!');
            return;
        }
        if (video.checkedOutTo !== customerId) {
            const customer = videoStore.findCustomer(video.checkedOutTo);
            alert(`Video is checked out to ${customer?.name || 'another customer'}`);
            return;
        }

        const success = videoStore.doReturn(name);
        document.getElementById('return-name').value = '';
        document.getElementById('return-customer').value = '';
        if (success) {
            updateInventoryTable();
            updateCustomersTable();
            alert(`Video "${name}" returned successfully!`);
        }
    });

    document.getElementById('rate-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('rate-name').value.trim();
        const rating = parseInt(document.getElementById('rating').value);
        if (name && rating >= 1 && rating <= 5) {
            const success = videoStore.receiveRating(name, rating);
            document.getElementById('rate-name').value = '';
            document.getElementById('rating').value = '';
            alert(success ? `Rating "${rating}" has been mapped to the Video "${name}"!` : 'Video not found!');
        }
    });

    // Update inventory table
    function updateInventoryTable() {
        const tbody = document.querySelector('#inventory-table tbody');
        tbody.innerHTML = '';
        
        videoStore.listInventory().forEach(video => {
            const tr = document.createElement('tr');
            const customer = video.checkedOutTo ? videoStore.findCustomer(video.checkedOutTo) : null;
            tr.innerHTML = `
                <td>${video.getName()}</td>
                <td>${video.category}</td>
                <td>${video.year}</td>
                <td>${video.director}</td>
                <td class="${video.getCheckout() ? 
                    (new Date(video.dueDate) < new Date() ? 'status-overdue' : 'status-checked-out') 
                    : 'status-available'}">
                    ${video.getCheckout() ? 
                     `Checked Out to ${customer?.name || 'Unknown'}${new Date(video.dueDate) < new Date() ? ' (Overdue)' : ''}` 
                     : 'Available'}
                </td>
                <td>${'★'.repeat(video.getRating())}${'☆'.repeat(5 - video.getRating())}</td>
            `;
            if (video.getCheckout()) {
                tr.setAttribute('data-checked-out', 'true');
                tr.addEventListener('click', () => {
                    document.getElementById('return-name').value = video.getName();
                    document.getElementById('return-name').focus();
                });
            }
            tbody.appendChild(tr);
        });
    }
});
