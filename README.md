# Video Store Management System

A web-based application for managing a video rental store, with features for inventory management, customer tracking, and rental operations.

## Features

- **Video Management**:
  - Add new videos with details (name, category, year, director)
  - View complete inventory
  - Rate videos (1-5 stars)
  
- **Rental Operations**:
  - Check out videos to customers
  - Return videos
  - Track due dates and overdue items
  
- **Customer Management**:
  - Add/edit/delete customers
  - View customer rental history
  - Track currently rented items

- **Data Persistence**:
  - All data saved in browser's localStorage
  - Option to clear all data

## Screenshots

![Main Interface](screenshot.png)

## Installation & Usage

1. Clone or download the repository
2. Open `index.html` in any modern web browser
3. No additional dependencies required

## Data Storage

All data is persisted in the browser's localStorage:

- Videos: stored under key 'videoStore'
- Customers: stored under key 'videoCustomers'

To clear all data, use the "Clear All Data" button (irreversible).
