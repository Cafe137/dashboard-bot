import assert from 'node:assert'
import { chromium } from 'playwright'
import { Dashboard } from './dashboard'
import { Server } from './server'

async function main() {
    const dashboard = new Dashboard()
    await dashboard.start()

    const server = new Server()
    await server.start()

    const browser = await chromium.launch({ headless: true, slowMo: 300 })
    const context = await browser.newContext()
    const page = await context.newPage()

    // Go to Dashboard with dummy API key
    await page.goto('http://localhost:3002?v=1')
    assert((await page.title()) === 'Swarm')

    // Make sure we are in ultra light mode
    await page.waitForSelector('text=ultra-light')
    assert((await page.locator('text=ultra-light').count()) === 1)

    // Set RPC to fake-bee
    await page.click('text=Settings')
    await page.click('.MuiIconButton-label')
    await page.fill('.MuiInputBase-input', 'http://localhost:1635')
    await page.click('text=Save and restart')

    // Set up wallet and upgrade to light mode
    await page.click('text=Info')
    await page.click('text=Setup wallet')
    await page.click('text=Use xDAI')
    await page.waitForSelector('text=13.9529')
    await page.click('text=Proceed')
    await page.click('text=Swap Now and Upgrade')

    // Make sure we are in light mode
    await page.waitForSelector('text=Mode')
    await page.waitForSelector('text=Current wallet balance')
    await page.waitForSelector('text=light')
    assert((await page.locator('text=ultra-light').count()) === 0)

    // Swap some xDAI
    await page.click('text=Account')
    await page.click('text=Top up wallet')
    await page.click('text=Use xDAI')
    await page.waitForSelector('text=13.9529')
    await page.click('text=Proceed')
    await page.click('text=Swap Now')

    // Buy a new stamp and assert its batch ID
    const expectedBatchId = await server.getNextBatchId()
    await page.click('text=Files')
    await page.click('text=Account')
    await page.click('text=Stamps')
    await page.click('text=Buy New Postage Stamp')
    await page.fill('input >> nth=0', '22')
    await page.fill('input >> nth=1', '30000000')
    await page.click('text=Buy New Stamp')
    await page.waitForSelector(`text=${expectedBatchId.slice(0, 8)}`)
    assert((await page.locator(`text=${expectedBatchId.slice(0, 8)}`).count()) === 1)

    // Upload a file
    await page.click('text=Files')
    const [fileChooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('text=Add File')])
    await fileChooser.setFiles('index.js')
    await page.click('button', { hasText: 'Add Postage Stamp' })
    await page.click('text=Please select a postage stamp...')
    await page.click(`text=${expectedBatchId.slice(0, 8)}`)
    await page.click('text=Proceed With Selected Stamp')
    await page.click('text=Upload To Your Node')

    await context.close()
    await browser.close()
    await server.close()
    await dashboard.close()
    process.exit(0)
}

main()
