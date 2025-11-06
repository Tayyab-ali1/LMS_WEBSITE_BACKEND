import express from 'express'
import { createSafepayOrder, verifySafepayPayment } from '../controller/ordercontroller.js'


const paymentRouter =express.Router()


paymentRouter.post("/razorpay-order",createSafepayOrder)
paymentRouter.post("/verifypayment",verifySafepayPayment)




export default paymentRouter