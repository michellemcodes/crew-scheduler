//Populate form with existing events
function getEventsForForm() {
    const eventAjax = $.ajax({
        method: 'GET',
        url: '/api/events',
    })

    $.when(eventAjax).done(events => {

        for (index in events) {
            const crewPositions = events[index].positions
            let positionsToStaff = []

            //Store event data
            const eventId = events[index].id
            const date = events[index].date
            const time = events[index].time
            const call = events[index].call
            const sport = events[index].sport
            const opponent = events[index].opponent
            const location = events[index].location

            //Request crew and availability for each specific event
            const availabilityAjax = $.ajax({
                method: 'GET',
                url: `/api/availability/${eventId}`,
            })

            const crewAjax = $.ajax({
                method: 'GET',
                url: `api/crew/${eventId}`
            })


            $.when(availabilityAjax, crewAjax).done((availabilityResponse, crewResponse) => {
                const availability = availabilityResponse[0]
                const crews = crewResponse[0]
                let crewAvailability;
                let availableCrew = []

                // If statement accounts for if no availability exists for the event yet. Otherwise, creates an array of all people available for event.
                if (availability[0] != undefined) {
                    crewAvailability = availability[0].availableCrew

                    for (let i = 0; i < crewAvailability.length; i++) {
                        availableCrew.push(`<option>${crewAvailability[i]}</option>`)
                    }

                }

                for (let j = 0; j < crewPositions.length; j++) {
                    // Checks to see if crew already exists on event, and sorts the crew so it will display the same every time.
                    let sortedCrew = null
                    if (crews.length > 0 && crews[0].crew != undefined) {
                        sortedCrew = crews[0].crew.sort((a, b) => { return (a.position > b.position) ? 1 : ((b.position > a.position) ? -1 : 0) })
                    }

                    // Accounts for if no crew yet exists.
                    if (crews[0] === undefined || crews[0].crew === undefined || crews[0].crew.length === 0 || sortedCrew[j] === undefined) {
                        positionsToStaff.push(`
                        <div class="assign-container">
                            <label for="${crewPositions[j]}" class="label assign-event-details" id="${crewPositions[j]}">${crewPositions[j]}</label>
                            <select class="available-crew" name="${crewPositions[j]}" id="${crewPositions[j]}">
                                <option disabled selected>Choose Crew</option>
                                ${availableCrew.join()}
                            </select>
                            <button type="submit" class="crew-assign-submit">Save</button> 
                        </div>     
                        `)
                    } else if (sortedCrew[j].position === crewPositions[j]) {
                        const crewIndex = availableCrew.indexOf(`<option>${sortedCrew[j].crewMember}</option>`)
                        if (availableCrew.includes(`<option>${sortedCrew[j].crewMember}</option>`)) {
                            availableCrew.splice(crewIndex, 1)
                        }
                        positionsToStaff.push(`
                            <div class="assign-container">
                                <label for="${crewPositions[j]}" class="label assign-event-details" id="${crewPositions[j]}">${crewPositions[j]}</label>
                                <select class="available-crew" name="${crewPositions[j]}" id="${crewPositions[j]}">
                                    <option selected>${sortedCrew[j].crewMember}</option>
                                    ${availableCrew.join()}
                                </select>  
                                <button type="submit" class="crew-assign-submit">Save</button>
                            </div>             
                            `)
                        availableCrew.splice(0, 0, `<option>${sortedCrew[j].crewMember}</option>`)
                    }
                }



                $('.schedule').append(
                    `<form class="event-form" id="${eventId}">
                    <p class="event-details">Date: <span class="date event-details">${date}</span></p>
                    <p class="event-details">Game Time: <span class="time event-details">${time}</span></p>
                    <p class="event-details">Call Time: <span class="call event-details">${call}</span></p>                    
                    <p class="event-details">Event: <span class="sport event-details">${sport}</span> vs. <span class="opponent event-details">${opponent}</span></p>
                    <p class="event-details">Location: <span class="location event-details">${location}</span></p>
                    <br>
                    <p class="event-details">Positions</p>
                    ${positionsToStaff.join("<br>")}
                </form>`
                )


                $.ajax({
                    method: 'POST',
                    url: '/api/crew',
                    data: JSON.stringify({
                        'eventId': `${eventId}`,
                    }),
                    contentType: 'application/json',
                    dataType: 'json',
                    success: response => $('.message').html(response),
                    error: error => $('.message').html(error)
                })


            })


        }

    })

}


// Assigns crew to events.
function assignCrew() {
    $('.schedule').on('click', '.crew-assign-submit', (e) => {
        e.preventDefault()
        let crewId = null
        const eventId = $(e.currentTarget).closest('form').attr('id')
        const crewMember = $(e.currentTarget).prev().val()
        const crewPosition = $(e.currentTarget).prev().prev('label').text()
        const crewAjax = $.ajax({
            method: 'GET',
            url: `/api/crew/${eventId}`,
        })
        // In event the crew is being updated, this avoids duplicate listing on positions. Before "Camera 1" is assigned, any existing "Camera 1" will be removed.
        const removePositionAjax = crewAjax.then((response) => {
            crewId = response[0].id
            return $.ajax({
                method: 'PUT',
                url: `/api/crew/${crewId}/${crewPosition}`
            })
        })
        const assignPositionAjax = removePositionAjax.then((response) => {
            let crew = { id: crewId, eventId: eventId, crew: { position: crewPosition, crewMember: crewMember } }
            return $.ajax({
                method: 'PUT',
                url: `/api/crew/${crewId}`,
                data: JSON.stringify(crew),
                contentType: 'application/json',
                dataType: 'json'
            })
        })


        assignPositionAjax.done(response => {
            $('.message').html(`<p>Success.</p>`)
        })
    })
}

function handleAssignCrewPage() {
    getEventsForForm()
    assignCrew()
}

// Redirect for dashboard
$('#dashboard').on('click', (e) => {
    e.preventDefault()
    window.location = 'admin-dashboard.html'
})

handleAssignCrewPage()
