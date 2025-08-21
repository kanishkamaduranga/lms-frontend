# Course Management Module

This module provides comprehensive course management functionality for the LMS system, including category management and course creation with rich content support.

## Features

### 2.1 Course Categories Management

#### CategoryList Component
- ✅ **Hierarchical Display**: Shows categories in a nested structure (e.g., Grade 6 > Science)
- ✅ **CRUD Operations**: Create, read, update, delete categories
- ✅ **Nesting Support**: Create subcategories with parent-child relationships
- ✅ **Reorder Functionality**: Change category positions
- ✅ **Visual Hierarchy**: Indented display with folder icons and subdirectory indicators
- ✅ **Category Path Display**: Shows full path (e.g., "Grade 6 > Science > Physics")

#### CategoryForm Component
- ✅ **Category Creation**: Add new categories with name, parent, and position
- ✅ **Category Editing**: Modify existing category properties
- ✅ **Parent Selection**: Choose parent category for nesting
- ✅ **Position Control**: Set display order
- ✅ **Validation**: Prevent self-reference in parent selection

### 2.2 Course Management

#### CourseList Component
- ✅ **Course Display**: Comprehensive table with all course metadata
- ✅ **Status Indicators**: Upcoming, Active, Completed status chips
- ✅ **Duration Formatting**: Human-readable duration (e.g., "2h 30m")
- ✅ **Date Display**: Formatted start and end dates
- ✅ **Instructor Display**: Shows instructor name from dedicated instructor API
- ✅ **Category Tags**: Visual category indicators
- ✅ **Tag Display**: Course tags with icons
- ✅ **Responsive Design**: Mobile-friendly table layout

#### CourseForm Component
- ✅ **Rich Metadata**: Name, description, duration, dates, tags, categories
- ✅ **Date Validation**: Ensures end date is after start date
- ✅ **Tag Management**: Add/remove tags with autocomplete
- ✅ **Category Selection**: Multi-select categories
- ✅ **Form Validation**: Required field validation
- ✅ **Instructor Assignment**: Dropdown list of instructors using dedicated API endpoint

### 2.3 Course Content Management

#### CourseContentForm Component
- ✅ **Multiple Content Types**: Support for all required content types
  - **Text Content**: Rich text with markdown support
  - **PDF Documents**: Direct PDF file URLs
  - **PowerPoint Presentations**: PPT/PPTX file URLs
  - **Videos**: YouTube, Vimeo, or direct video URLs
  - **Quizzes**: Quiz instructions and configuration URLs
- ✅ **Content Type Icons**: Visual indicators for each content type
- ✅ **Dynamic Forms**: Different fields based on content type
- ✅ **Position Control**: Set content order within courses
- ✅ **Validation**: Type-specific validation rules

## API Integration

### Course Service (`courseService.js`)
Comprehensive service layer handling all course-related operations:

#### Category Operations
- `getAllCategories()` - Fetch all categories
- `getCategoryById()` - Get single category
- `createCategory()` - Create new category
- `updateCategory()` - Update category
- `renameCategory()` - Rename category
- `reorderCategory()` - Change category position
- `deleteCategory()` - Delete category

#### Course Operations
- `getAllCourses()` - Fetch all courses
- `getCourseById()` - Get course with categories & contents
- `createCourse()` - Create new course
- `updateCourse()` - Update course
- `deleteCourse()` - Delete course

#### Content Operations
- `addCourseContent()` - Add content to course
- `updateCourseContent()` - Update course content
- `deleteCourseContent()` - Delete course content
- `reorderCourseContent()` - Reorder content within course

#### Instructor Integration
- Uses `userService.getByRole('Instructor')` to fetch available instructors
- API Endpoint: `GET /api/users/role/Instructor`
- Response: `{ message, count, role, users: [{ id, full_name }] }`

## Data Models

### Category Structure
```javascript
{
  id: number,
  name: string,
  parent_id: number | null,
  position: number,
  created_at: string,
  updated_at: string
}
```

### Course Structure
```javascript
{
  id: number,
  name: string,
  description: string,
  duration_minutes: number,
  start_date: string,
  end_date: string,
  tags: string[],
  instructor_id: number, // References user.id from users table
  category_ids: number[],
  created_at: string,
  updated_at: string
}
```

### Content Structure
```javascript
{
  id: number,
  content_type: 'text' | 'pdf' | 'ppt' | 'video' | 'quiz',
  content_text: string,
  file_url: string,
  metadata: object,
  position: number,
  created_at: string,
  updated_at: string
}
```

## Usage

### Basic Usage
```jsx
import { CourseManagement } from './components/courses';

// In your route
<Route path="/admin/courses" element={<CourseManagement />} />
```

### Individual Components
```jsx
import { 
  CategoryList, 
  CategoryForm, 
  CourseList, 
  CourseForm, 
  CourseContentForm 
} from './components/courses';

// Use individual components as needed
<CategoryList />
<CourseList />
<CourseForm open={open} onClose={handleClose} onSave={handleSave} />
```

## Navigation

### Tab-Based Interface
The CourseManagement component provides a tabbed interface:
- **Categories Tab**: Manage course categories and hierarchy
- **Courses Tab**: Manage courses and their metadata

### Access Routes
- `/admin/courses` - Main course management interface
- Categories and courses are managed within the same interface

## Features in Detail

### Category Hierarchy
- **Visual Indentation**: Child categories are visually indented
- **Path Display**: Full category path shown (e.g., "Grade 6 > Science > Physics")
- **Subcategory Count**: Shows number of subcategories for each category
- **Nested Operations**: Delete parent categories removes all children

### Course Metadata
- **Comprehensive Information**: All required metadata fields
- **Status Calculation**: Automatic status based on current date vs. course dates
- **Duration Formatting**: Human-readable time display
- **Tag Management**: Flexible tag system with autocomplete
- **Category Assignment**: Multi-category support

### Content Types
- **Text**: Rich text content with markdown support
- **PDF**: Direct PDF file links
- **PowerPoint**: Presentation file links
- **Video**: YouTube, Vimeo, or direct video URLs
- **Quiz**: Quiz instructions and configuration files

## Styling and UX

### Design Principles
- **Consistent with LMS**: Follows existing design patterns
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: Screen reader compatible
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

### Visual Elements
- **Icons**: Content type icons, folder icons, action icons
- **Chips**: Status indicators, tags, category labels
- **Color Coding**: Different colors for different content types
- **Hover Effects**: Interactive table rows and buttons

## Security and Validation

### Form Validation
- **Required Fields**: Essential fields are validated
- **Date Validation**: Ensures logical date ranges
- **Content Validation**: Type-specific validation rules
- **URL Validation**: Validates file and video URLs

### Data Integrity
- **Category Hierarchy**: Prevents circular references
- **Content Ordering**: Maintains content sequence
- **Relationship Management**: Proper category-course relationships

## Future Enhancements

### Planned Features
1. **Bulk Operations**: Import/export categories and courses
2. **Advanced Search**: Search across categories and courses
3. **Content Preview**: Preview content before adding
4. **Analytics**: Course usage and completion statistics
5. **Templates**: Pre-defined course templates

### Technical Improvements
1. **Caching**: Optimize API calls with caching
2. **Real-time Updates**: WebSocket integration for live updates
3. **File Upload**: Direct file upload instead of URLs
4. **Rich Text Editor**: Enhanced text content editing
5. **Content Versioning**: Track content changes over time

## Dependencies

- React
- Material-UI
- React Router (for navigation)
- Custom API utilities
- Authentication context

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Progressive Web App compatible
