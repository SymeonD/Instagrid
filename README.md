# Instagrid
An image splitter and grid maker for the new instagram layout

# Link
[https://symeond.github.io/Instagrid/](https://symeond.github.io/Instagrid/)

# TODO
- [x] Show in the left column the cut down image to the right format
- [x] Check the dimension so that it works best for instagram (1010, 1015...) maybe put in global settings
- [x] When grid image is selected and del or backspace pressed, remove it
- [x] if grid is clicked outside an image, reset the selected element
- [x] Tests

# V.0.1
- [x] Remove or implement edit buttons
- [x] Check for image format
- [x] Add dark mode
- [x] Fix error where the imported element can be put on top of another
- [x] Rework style
  - [x] New Figma design
  - [x] New right column
  - [x] New left column
  - [x] New header
  - [x] New grid
  - [x] New import menu
- [x] Mobile version
  - [x] Change side of chevron
  - [x] Change import prompt layout
  - [x] Change font sizes
  - [x] Update header
  - [x] "Add image" button outside the modal
    - [x] Right modal smaller to account for the outside button
  - [x] Add backdrop on the side modals and close when clicked
- [x] Publish

# V.1.0
- [x] Close backdrop when photos are imported
- [x] Open modal when photos are imported
- [x] Close modal when photos are deleted
- [ ] Fix import prompt display when image is edited to 3x1
- [x] Fix modal not closing when clicked on top of add image button
- [x] Change grid lines sizes on mobile
- [ ] Fix delay when open and close columns buttnos are clicked

# Improvements
- [ ] Improve canvas performances
- [ ] Improve styling system including mat-styling
- [ ] Add image crop settings where you can move the zone that's gonna be selected and cut, link it to the menu on the left
- [ ] Enable selection of output image type
- [ ] Add instagram account preview with header
- [ ] Add visible image separation on the images in the grid
- [ ] Multiple item selection and download
- [ ] Fix header when modal is opened
- [ ] Change right panel mobile state management to service and own parameters
- [ ] Make add image button white background truly transparent

# Discarded
- [x] Add texts in the prompts, explanations about preview quality