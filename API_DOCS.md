# Video Store API Documentation

## Classes

### `Customer`
Represents a store customer

**Constructor**:
```js
new Customer(name, email, phone)
```

**Properties**:
- `id`: Auto-generated unique identifier
- `name`: Customer name
- `email`: Customer email
- `phone`: Customer phone number
- `rentalHistory`: Array of rental records

### `Video`
Represents a video in inventory

**Constructor**:
```js
new Video(name, category = 'General', year = '', director = '')
```

**Methods**:
- `getName()`: Returns video name
- `doCheckout()`: Marks video as checked out
- `doReturn()`: Marks video as returned
- `receiveRating(rating)`: Sets video rating (1-5)
- `getRating()`: Returns current rating
- `getCheckout()`: Returns checkout status

### `VideoStore`
Main application class managing all operations

**Methods**:

#### Video Operations
- `addVideo(name, category, year, director)`: Adds new video
- `doCheckout(name, customerId)`: Checks out video
- `doReturn(name)`: Returns video
- `receiveRating(name, rating)`: Rates video
- `listInventory()`: Returns all videos
- `findVideo(name)`: Finds video by name

#### Customer Operations
- `addCustomer(name, email, phone)`: Adds new customer
- `findCustomer(id)`: Finds customer by ID
- `updateCustomer(id, name, email, phone)`: Updates customer details
- `deleteCustomer(id)`: Removes customer
- `getCustomerRentals(id)`: Returns customer's rental history

#### Data Persistence
- `saveVideos()`: Saves videos to localStorage
- `loadVideos()`: Loads videos from localStorage
- `saveCustomers()`: Saves customers to localStorage
- `loadCustomers()`: Loads customers from localStorage

## DOM Event Handlers
- Form submissions for all operations
- Menu navigation
- Table updates
- Data validation and error handling
