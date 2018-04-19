function getEvents() {
    const eventAjax = $.ajax({
        method: 'GET',
        url: '/api/events',
    })
    const crewAjax = $.ajax({
        method: 'GET',
        url: 'api/crew/'
    })


    $.when(eventAjax, crewAjax).done((eventsResponse, crewResponse) => {
            const events = eventsResponse[0]
            const crews = crewResponse[0]
            for (index in events) {
                const sortedCrew = crews[index].crew.sort((a,b) => {return (a.position > b.position) ? 1 : ((b.position > a.position) ? -1 : 0)} )
                const crewArray = Object.values(sortedCrew).map(pos => Object.values(pos).toString())
                const fullCrew = crewArray.toString() + ','
                const regex = /([^,]*),([^,]*),/gi
                const subst = `$1: $2<br>`
                const crew = fullCrew.replace(regex, subst)
                if (crewArray === undefined || crewArray.length == 0) {
                    $('.schedule').append(
                        `<br><div class="event">${events[index].date} ${events[index].time} ${events[index].call} ${events[index].sport} vs. ${events[index].opponent} ${events[index].location}<br></div>`)
                } else {
                    $('.schedule').append(
                        `<br><div class="event">${events[index].date} ${events[index].time} ${events[index].call} ${events[index].sport} vs. ${events[index].opponent} ${events[index].location}<p>Crew:</p>${crew}<br><br></div>`)
                }
            }

        })


}


$('#new-event').on('click', (e) => {
    e.preventDefault()
    window.location = 'create-events.html'
})


$('#assign-crew').on('click', (e) => {
    e.preventDefault()
    window.location = '/assign-crew.html'
})

$('#edit-availability').on('click', (e) => {
    e.preventDefault()
    window.location = 'availability.html'
})

// Edit or Delete Event Categories

function handleEditEventCategoriesClick() {
    $('#edit-categories').on('click', (e) => {
        e.preventDefault()
        $('.category-fieldset').prop('hidden', false)
        $('.schedule').prop('hidden', true)
        $('.schedule-button').prop('hidden', false)
    })
}

function handleSelectCategory() {
    $('.edit-submit').on('click', (e) => {
        e.preventDefault()
        $('.category-values').html('')
        let category = $('#category').val().toLowerCase()
        $('#category').val("")
        $.ajax({
            method: 'GET',
            url: `/api/${category}`,
            success: response => {
                if (category === 'sports') {
                    for (index in response) {
                        $(".category-values").append(
                            `<div id="${category}">
                            <p class="${response[index].sport}">${response[index].sport}</p>
                            <p class="id" id="${response[index].id}" hidden>${response[index].id}</p>
                            <button class="edit-button">Edit</button>
                            <button class="delete-button">Delete</button>
                        </div>
                         `)
                    }
                } else if (category === 'opponents') {
                    for (index in response) {
                        $(".category-values").append(
                            `<div id="${category}">
                            <p class="${response[index].opponent}">${response[index].opponent}</p>
                            <p class="id" id="${response[index].id}" hidden>${response[index].id}</p>
                            <button class="edit-button">Edit</button>
                            <button class="delete-button">Delete</button>
                            </div>
                             `)
                    }
                } else if (category === 'locations') {
                    for (index in response) {
                        $(".category-values").append(
                            `<div id="${category}">
                                <p class="${response[index].location}">${response[index].location}</p>
                                <p class="id" id="${response[index].id}" hidden>${response[index].id}</p>
                                <button class="edit-button">Edit</button>
                                <button class="delete-button">Delete</button>
                                </div>
                                 `)
                    }
                } else if (category === 'positions') {
                    for (index in response) {
                        $(".category-values").append(
                            `<div id="${category}">
                                    <p class="${response[index].position}">${response[index].position}</p>
                                    <p class="id" id="${response[index].id}" hidden>${response[index].id}</p>
                                    <button class="edit-button">Edit</button>
                                    <button class="delete-button">Delete</button>
                                    </div>
                                     `)
                    }

                }
                $('.category').trigger('reset')
            },
            error: error => console.log(error)
        })
    })
}

function watchSignOutClick() {
    $('#sign-out').click((e) => {
        e.preventDefault()
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('username')
        localStorage.removeItem('role')
        window.location.href = "/"
    })
}

function deleteItem() {
    $('.category-values').on('click', '.delete-button', (e) => {
        e.preventDefault()
        const category = $(e.currentTarget).parent('div').attr('id')
        const id = $(e.currentTarget).siblings('.id').attr('id')
        console.log(id)
        $.ajax({
            method: 'DELETE',
            url: `/api/${category}/${id}`,
            success: response => {
                $('.message').html(`<p>Deleted successfully.</p>`)
                $(e.currentTarget).parent('div').remove()
            },
            error: error => {
                $('.message').html(`<p>Please fill out all fields</p>`)
            }
        })
    })
}


function handleEditItemClick() {
    $('.category-values').on('click', '.edit-button', (e) => {
        e.preventDefault()
        const category = $(e.currentTarget).parent('div').attr('id')
        console.log(category)
        const id = $(e.currentTarget).siblings('.id').attr('id')
        $('.edit-item-form').prop('hidden', false)
        $('.edit-item').on('click', '.edit-put-submit', (e) => {
            e.preventDefault()
            let newData = null
            if (category === 'sports') {
                newData = { "id": id, "sport": $('.edit-item-input').val() }
            } else if (category === 'opponents') {
                newData = { "id": id, "opponent": $('.edit-item-input').val() }
            } else if (category === 'locations') {
                newData = { "id": id, "location": $('.edit-item-input').val() }
            } else if (category === 'positions') {
                newData = { "id": id, "position": $('.edit-item-input').val() }
            }
            $.ajax({
                method: 'PUT',
                url: `/api/${category}/${id}`,
                data: JSON.stringify(newData),
                contentType: 'application/json',
                dataType: 'json',
                success: response => {
                    $('.message').html(`<p>Item edited successfully, page will reload.</p>`)
                }
            })
            setTimeout(() => { location.reload(true) }, 2000)
        })
    })
}

function deleteAndEditCategories() {
    handleEditEventCategoriesClick()
    handleEditItemClick()
    handleSelectCategory()
    deleteItem()
}




deleteAndEditCategories()
getEvents()
watchSignOutClick()