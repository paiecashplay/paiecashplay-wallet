import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export const sendTransactionEmail = async (
  to: string,
  type: 'deposit' | 'withdrawal' | 'payment',
  amount: number,
  reference: string
) => {
  const subject = type === 'deposit' ? 'Dépôt effectué' : 
                 type === 'withdrawal' ? 'Retrait effectué' : 'Paiement effectué'
  
  const html = `
    <h2>Transaction ${subject}</h2>
    <p>Montant: ${amount} FCFA</p>
    <p>Référence: ${reference}</p>
    <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
  `

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html
  })
}