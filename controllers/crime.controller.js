const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.createCrime = async (req, res) => {
  const { title, description, location, photo } = req.body;

  const crime = await prisma.crime.create({
    data: { title, description, location, photo }
  });

  res.json(crime);
};

exports.getCrimes = async (req, res) => {
  const crimes = await prisma.crime.findMany();
  res.json(crimes);
};

exports.updateCrimeStatus = async (req, res) => {
  try {
    const { crimeId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["Pending", "Investigating", "Resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const crime = await prisma.crime.update({
      where: { id: crimeId },
      data: { status }
    });

    res.json({ message: "Crime status updated", crime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateCrime = async (req, res) => {
  try {
    const { crimeId } = req.params;
    const { title, description, location, status, photo } = req.body;

    // Build update data object
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (location) updateData.location = location;
    if (status) updateData.status = status;
    if (photo !== undefined) updateData.photo = photo;

    // Validate status if provided
    if (status) {
      const validStatuses = ["Pending", "Investigating", "Resolved"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
    }

    const crime = await prisma.crime.update({
      where: { id: crimeId },
      data: updateData,
    });

    res.json({ message: "Crime updated successfully", crime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteCrime = async (req, res) => {
  try {
    const { crimeId } = req.params;

    const crime = await prisma.crime.delete({
      where: { id: crimeId },
    });

    res.json({ message: "Crime deleted successfully", crime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
