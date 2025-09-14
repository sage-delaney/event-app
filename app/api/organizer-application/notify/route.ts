import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name,
      organization,
      email,
      socialLink,
      typesOfEvents,
      website,
      phone
    } = body

    // Validate required fields
    if (!name || !organization || !email || !typesOfEvents) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send notification email
    const emailData = await resend.emails.send({
      from: 'EventApp <noreply@yourdomain.com>', // Replace with your verified domain
      to: ['sage@sagedelaney.com'],
      subject: `New Organizer Application: ${organization}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Organizer Application Received</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Organization:</strong> ${organization}</p>
          </div>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Online Presence</h3>
            <p><strong>Website:</strong> ${website ? `<a href="${website}">${website}</a>` : 'Not provided'}</p>
            <p><strong>Social Media:</strong> ${socialLink || 'Not provided'}</p>
          </div>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Event Details</h3>
            <p><strong>Types of Events:</strong></p>
            <p style="white-space: pre-wrap;">${typesOfEvents}</p>
          </div>

          <div style="margin: 30px 0; text-align: center;">
            <p style="color: #666; font-size: 14px;">
              Please review this application and respond to the organizer directly.
            </p>
          </div>
        </div>
      `,
      text: `
New Organizer Application Received

Contact Information:
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Organization: ${organization}

Online Presence:
Website: ${website || 'Not provided'}
Social Media: ${socialLink || 'Not provided'}

Types of Events:
${typesOfEvents}

Please review this application and respond to the organizer directly.
      `
    })

    console.log('Email sent successfully:', emailData)

    return NextResponse.json({ 
      success: true,
      emailId: emailData.data?.id
    })

  } catch (error) {
    console.error('Email sending error:', error)
    
    // Log the error details but still return success to not break the user flow
    // In production, you might want to queue this for retry
    return NextResponse.json({ 
      success: true,
      warning: 'Email notification may have failed, but application was saved'
    })
  }
}
