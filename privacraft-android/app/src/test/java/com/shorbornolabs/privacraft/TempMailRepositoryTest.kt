package com.shorbornolabs.privacraft

import com.shorbornolabs.privacraft.data.repository.TempMailRepository
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Test

class TempMailRepositoryTest {

    @Test
    fun testCreateMailboxAndFetch() = runBlocking {
        val repository = TempMailRepository()
        val result = repository.createMailbox("sharklasers.com")
        assertTrue("Mailbox creation should succeed: ${result.exceptionOrNull()?.message}", result.isSuccess)

        val mailbox = result.getOrNull()
        assertNotNull(mailbox)
        assertTrue(mailbox!!.address.endsWith("@sharklasers.com"))
        assertNotNull(mailbox.token)
        println("Test generated address: ${mailbox.address}")

        val msgResult = repository.fetchMessages(mailbox)
        assertTrue("Fetching messages should succeed: ${msgResult.exceptionOrNull()?.message}", msgResult.isSuccess)
        val messages = msgResult.getOrNull()
        assertNotNull(messages)
        println("Initial inbox size: ${messages!!.size}")
    }
}
